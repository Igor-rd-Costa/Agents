import {Dispatcher} from "undici-types";
import HttpMethod = Dispatcher.HttpMethod;

export type StreamingResponseDataCallback = (data: string) => void;
export type StreamingResponseErrorCallback = (error: any) => void;
export type StreamingResponseFinishCallback<T> = (extraData: T|null) => void;

const MESSAGE_TYPE_STRINGS =  {
    data: "data: ",
    event: "event: ",
    extra: "extra: "
};

export class StreamingResponse<T = string> {
    private onDataCallback: StreamingResponseDataCallback = () => {}
    private onErrorCallback: StreamingResponseErrorCallback = () => {}
    private onFinishCallback: StreamingResponseFinishCallback<T> = () => {}
    private extraData: T|null = null;
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
                    if (done) {
                        break;
                    }

                    const chunks = decoder.decode(value)
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
            this.onFinishCallback(this.extraData);
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
                values.push({extra: parts[i].substring(MESSAGE_TYPE_STRINGS.extra.length)})
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