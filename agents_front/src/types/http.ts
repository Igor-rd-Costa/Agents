import {Dispatcher} from "undici-types";
import HttpMethod = Dispatcher.HttpMethod;

export type StreamingResponseDataCallback = (data: string) => void;
export type StreamingResponseErrorCallback = (error: any) => void;
export type StreamingResponseFinishCallback = () => void;

export class StreamingResponse {
    private onDataCallback: StreamingResponseDataCallback = () => {}
    private onErrorCallback: StreamingResponseErrorCallback = () => {}
    private onFinishCallback: StreamingResponseFinishCallback = () => {}
    private error: string|null = null;

    public constructor(path: string, method: HttpMethod, body?: any) {
        new Promise<void>(async resolve => {
            const response = await fetch(path, {
                method,
                headers: {
                    "Content-Type": "application/json",
                },
                body
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
                        .flatMap(this.getChucks);

                    for (let i = 0; i < chunks.length; i++) {
                        const chunk = chunks[i];
                        if (chunk.data) {
                            this.onDataCallback(chunk.data);
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
            this.onFinishCallback();
        });
    }

    public onData(callback: StreamingResponseDataCallback) {
        this.onDataCallback = callback;
    }

    public onError(callback: StreamingResponseErrorCallback) {
        this.onErrorCallback = callback;
    }

    public onFinish(callback: StreamingResponseFinishCallback) {
        this.onFinishCallback = callback;
    }

    private readonly dataStr = "data: ";
    private readonly eventStr = "event: ";

    private getChucks(c: string) {
        const parts = c.split('\n');
        const values = [];
        for (let i = 0; i < parts.length; i++) {
            if (parts[i].startsWith(this.dataStr)) {
                values.push({data: parts[i].substring(this.dataStr.length)});
            }
            if (parts[i].startsWith(this.eventStr)) {
                values.push({event: parts[i].substring(this.eventStr.length)});
            }
        }
        return values;
    }
}