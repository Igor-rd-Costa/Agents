import chatService from "@/services/ChatService";
import {SSEEventType, SSEMessage, SSEMessageData, SSERequestCallback, SSEStream, ToolCall} from "@/types/http";
import {ChatDTO} from "@/types/chat/ChatDTO";
import {MessageType} from "@/components/mainPage/Message";

export type ChatData = {
    data: string|ToolCall[],
    messageType: MessageType,
    chat: {
        chat: ChatDTO|null,
        connectionId: string|null
    }
}

export default class ChatConnection {
    private connectionStream: SSEStream|null = null;
    private chatId: string|null = null;

    constructor(chatId: string|null) {
        this.chatId = chatId;
    }

    public testConnection() {
        return {isConnected: this.getIsConnected(), stream: this.connectionStream }
    }

    public getChatId() {
        return this.chatId;
    }

    public setChatId(chatId: string|null) {
        this.chatId = chatId;
    }

    public getIsConnected() {
        return this.connectionStream?.getIsConnected() ?? false;
    }

    public async connect(): Promise<boolean> {
        return new Promise(async resolve => {
            this.connectionStream = chatService.connect(this.chatId);
            console.log("Connection set", this.connectionStream);
            const connected = await this.connectionStream.waitConnected();
            resolve(connected);
        });
    }

    public async disconnect(): Promise<boolean> {
        return false;
    }

    public async sendMessage(message: string, callback: SSERequestCallback<ChatData>) {
        const conId = this.connectionStream?.getConnectionId();
        if (!conId) {
            return;
        }

        await this.connectionStream!.send<SSEMessageData, ChatData>(new SSEMessage<SSEMessageData>(
            "AAAAAA",
            'message',
            SSEEventType.REQUEST,
            new SSEMessageData<string>(conId, message),
            true
        ), callback)
    }

    private throwOnNullChatId() {
        if (this.chatId === null) {
            throw new Error("ChatConnection is not linked to a chat");
        }
    }
}