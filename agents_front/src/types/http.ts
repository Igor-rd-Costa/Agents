import {Dispatcher} from "undici-types";
import HttpMethod = Dispatcher.HttpMethod;

export type ToolCall = {
    name: string,
    namespace: string,
    args: { [key: string]: any }
}

type StreamingResponseFinishCallbackArg<T> = {
    extraData: T|null,
    tool: ToolCall[]|null
}

export type StreamingResponseDataCallback = (data: string) => void;
export type StreamingResponseErrorCallback = (error: any) => void;
export type StreamingResponseFinishCallback<T> = (arg: StreamingResponseFinishCallbackArg<T>) => void;

const MESSAGE_TYPE_STRINGS =  {
    data: "data: ",
    event: "event: ",
    extra: "extra: ",
    tool: "tool: "
};


export const backendUrl = "http://192.168.1.85:8000/";

export enum SSEEventType {
    REQUEST,
    RESPONSE,
    NOTIFICATION
}

export type SSEEvent = 'connect' | 'disconnect' | 'ping' | 'message';

export function isValidSSEEvent(event: string) {
    switch (event) {
        case 'connect':
        case 'disconnect':
        case 'ping':
        case 'message':
            return true;
        default:
            console.error(`[http.ts] isValidSSEEvent -> Invalid Event '${event}'`);
            return false;
    }
}

type SSEMessageDataValidatorFn<T> = (data: T) => boolean;

export class SSEMessageData<T = string> {

    public constructor(private readonly connectionId: string, private readonly data?: T) {
    }

    public getConnectionId() {
        return this.connectionId;
    }

    public getData() {
        return this.data;
    }
}

export class SSEMessage<T = string> {
    private id: string = '';
    private event: SSEEvent = 'ping';
    private eventType: SSEEventType = SSEEventType.REQUEST;
    private data?: T;
    private valid: boolean = false;

    public constructor(id: string, event: SSEEvent, eventType: SSEEventType, data?: T, valid?: boolean) {
        this.id = id;
        this.event = event;
        this.eventType = eventType;
        this.data = data;
        this.valid = valid ?? true;
    }

    private static INVALID_MESSAGE = new SSEMessage('', 'ping', SSEEventType.REQUEST, undefined, false);
    public static fromMessage<T>(messageStr: string, dataValidatorFn?: SSEMessageDataValidatorFn<T>): SSEMessage<T> {
        if (!messageStr.endsWith("\n\n")) {
            return this.INVALID_MESSAGE as SSEMessage<T>;
        }
        const lines = messageStr.substring(0, messageStr.length - 2).split('\n');
        const params: {[key: string]: string} = {};
        lines.forEach(line => {
            const separator = line.indexOf(':');
            if (separator === -1) {
                return;
            }

            const name = line.substring(0, separator).trim();
            const value = line.substring(separator + 1).trim();

            if (name === 'data' && params[name]) {
                params[name] += value;
            } else {
                params[name] = value;
            }
        });
        const id = params['id'];
        const event = params['event'];
        const eventType = parseInt(params['type']);
        const data = params['data'];

        if (!id
            || !isValidSSEEvent(event)
            || isNaN(eventType))
        {
            return this.INVALID_MESSAGE as SSEMessage<T>;
        }

        let dataObj: T;
        try {
            dataObj = JSON.parse(data) as T;
        } catch (e: unknown) {
            dataObj = data as T;
        }

        if (dataValidatorFn && !dataValidatorFn(dataObj)) {
            return this.INVALID_MESSAGE as SSEMessage<T>;
        }

        return new SSEMessage<T>(id, event as SSEEvent, eventType, dataObj);
    }

    public toString() {
        if (typeof this.data !== 'object') {
            const {valid, ...rest } = this;
            return JSON.stringify(rest);
        }
        const { valid, ...rest } = new SSEMessage<string>(this.id, this.event, this.eventType, JSON.stringify(this.data));
        return JSON.stringify(rest);
    }

    public isValid() {
        return this.valid;
    }

    public getId() {
        return this.id;
    }

    public getEvent() {
        return this.event;
    }

    public getEventType() {
        return this.eventType;
    }

    public getData() {
        return this.data;
    }
}

export type SSERequestCallback<T> = (msg: SSEMessage<T>) => void;
type SSEInternalRequestCallback<T> = (msg: SSEMessage<T>| PromiseLike<SSEMessage<T>>) => void
type PromiseResolveFn<T> = (val: T|PromiseLike<T>) => void;
type SSERequestCallbacks = {[key: string]: (SSERequestCallback<any>|SSEInternalRequestCallback<any>)[]};

export class SSEStream {
    private isConnected: boolean = false;
    private error: string|null = null;
    private connectPromise: Promise<boolean>|null = null;
    private responseListeners: SSERequestCallbacks = {}
    private connectionId: string|null = null;

    public constructor(private readonly path: string, private readonly method: HttpMethod, message?: SSEMessage) {
        let resolveConnect: PromiseResolveFn<boolean>;
        this.connectPromise = new Promise<boolean>(resolve => {
            resolveConnect = resolve;
        });
        new Promise<void>(async resolve => {
            const response = await fetch(this.path, {
                method: this.method,
                headers: {
                    "Content-Type": "application/json",
                },
                body: message ? message.toString() : '',
                credentials: "include"
            });

            const reader = response.body?.getReader();
            const decoder = new TextDecoder("utf-8");
            if (!reader) {
                this.error = "Could not retrieve body reader";
                resolveConnect(false);
                resolve();
                return;
            }

            while (true) {
                const {value, done} = await reader!.read();
                const decodedVal = decoder.decode(value);
                if (done) {
                    console.log("DONEEEEEEE!");
                    break;
                }

                const sseMessage = SSEMessage.fromMessage<string>(decodedVal);

                if (!sseMessage.isValid()) {
                    console.error("Invalid message!", decodedVal);
                    continue;
                }

                if (sseMessage.getEvent() === 'connect') {
                    this.connectionId = sseMessage.getData() ?? null;
                    resolveConnect(this.connectionId !== null);
                }

                if (this.connectionId === null) {
                    console.log("No connection Id");
                    resolve();
                    break;
                }

                switch (sseMessage.getEvent()) {
                    case 'connect': {
                        break;
                    }
                    case 'disconnect': {
                        this.isConnected = false;
                        break;
                    }
                    case 'ping': {
                        const pingResponseMsg = new SSEMessage(
                            sseMessage.getId(),
                            'ping',
                            SSEEventType.RESPONSE,
                            new SSEMessageData(this.connectionId)
                        );
                        await this.sendResponse(pingResponseMsg);
                        break;
                    }
                    case 'message': {
                        if (sseMessage.getEventType() === SSEEventType.NOTIFICATION) {
                            break;
                        }
                        const msgId = sseMessage.getId();
                        const listeners = this.responseListeners[msgId];
                        if (listeners) {
                            listeners.forEach(listener => {
                                listener(sseMessage);
                            });
                        }
                        break;
                    }
                }
            }
            console.log("Disconnected!");
        });
    }

    public async waitConnected() {
        if (this.connectPromise) {
            return await this.connectPromise;
        }
        return this.isConnected;
    }

    public getConnectionId() {
        return this.connectionId;
    }

    public async send<T, U = T>(message: SSEMessage<T>, callback?: SSERequestCallback<U>): Promise<SSEMessage<U>> {
        return new Promise<SSEMessage<U>>(async resolve => {
            const msgId = message.getId();
            if (!this.responseListeners[msgId]) {
                this.responseListeners[msgId] = [];
            }
            const listeners = this.responseListeners[msgId];
            listeners.push(resolve);
            if (callback) {
                listeners.push(callback);
            }
            await fetch(this.path, {
                method: this.method,
                headers: {
                    "Content-Type": "application/json",
                },
                body: message.toString(),
                credentials: "include"
            });
        });
    }

    public async sendResponse<T>(message: SSEMessage<T>): Promise<void> {
        await fetch(this.path, {
            method: this.method,
            headers: {
                "Content-Type": "application/json",
            },
            body: message.toString(),
            credentials: "include"
        });
    }
}

export class StreamingResponse<T = string> {
    private onDataCallback: StreamingResponseDataCallback = () => {}
    private onErrorCallback: StreamingResponseErrorCallback = () => {}
    private onFinishCallback: StreamingResponseFinishCallback<T> = () => {}
    private extraData: T|null = null;
    private tool: ToolCall[]|null = null;
    private error: string|null = null;

    public constructor(path: string, method: HttpMethod, body?: any) {
        new Promise<void>(async resolve => {
            const response = await fetch(path, {
                method,
                headers: {
                    "Content-Type": "application/json",
                },
                body,
                credentials: "include"
            });
            const reader = response.body?.getReader();
                const decoder = new TextDecoder("utf-8");
                if (!reader) {
                    this.error = "Could not retrieve body reader";
                    resolve();
                    return;
                }

                while (true) {
                    const { value, done } = await reader!.read();
                    const decodedVal = decoder.decode(value);
                    if (done) {
                        break;
                    }

                    const chunks = decodedVal
                        .split("\n\n")
                        .filter(c => c !== "")
                        .flatMap(this.getChucks.bind(this));

                    for (let i = 0; i < chunks.length; i++) {
                        const chunk = chunks[i];
                        if (chunk.data) {
                            this.onDataCallback(chunk.data);
                        }
                        if (chunk.extra) {
                            this.extraData = (JSON.parse(chunk.extra) as {extra: T}).extra;
                        }
                        if (chunk.tool) {
                            this.tool = JSON.parse(chunk.tool);
                        }
                        if (chunk.event && chunk.event === "end") {
                            break;
                        }
                    }
                }
                resolve();
        }).then(() => {
            if (this.error) {
                this.onErrorCallback(this.error);
            }
            this.onFinishCallback({extraData: this.extraData, tool: this.tool});
        });
    }

    private getChucks(c: string) {
        const parts = c.split('\n');
        const values = [];
        for (let i = 0; i < parts.length; i++) {
            if (parts[i].startsWith(MESSAGE_TYPE_STRINGS.data)) {
                values.push({data: parts[i].substring(MESSAGE_TYPE_STRINGS.data.length)});
            } else if (parts[i].startsWith(MESSAGE_TYPE_STRINGS.event)) {
                values.push({event: parts[i].substring(MESSAGE_TYPE_STRINGS.event.length)});
            } else if (parts[i].startsWith(MESSAGE_TYPE_STRINGS.extra)) {
                values.push({extra: parts[i].substring(MESSAGE_TYPE_STRINGS.extra.length)});
            } else if (parts[i].startsWith(MESSAGE_TYPE_STRINGS.tool)) {
                const value = parts[i].substring(MESSAGE_TYPE_STRINGS.tool.length);
                values.push({tool: value});
            }
        }
        return values;
    }

    public onData(callback: StreamingResponseDataCallback) {
        this.onDataCallback = callback;
    }

    public onError(callback: StreamingResponseErrorCallback) {
        this.onErrorCallback = callback;
    }

    public onFinish(callback: StreamingResponseFinishCallback<T>) {
        this.onFinishCallback = callback;
    }
}