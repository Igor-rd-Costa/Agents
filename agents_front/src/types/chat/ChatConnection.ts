import chatService from "@/services/ChatService";
import {SSEEventType, SSEMessage, SSEMessageData, SSERequestCallback, SSEStream, ToolCall} from "@/types/http";
import {ChatDTO} from "@/types/chat/ChatDTO";
import {MessageType} from "@/components/mainPage/Message";

type ChatData = {
    data: string|ToolCall[],
    messageType: MessageType,
    chat: ChatDTO|null
}

export default class ChatConnection {
    private isConnected: boolean = false;
    private connectionStream: SSEStream|null = null;

    constructor(private readonly chatId: string|null) {}

    public getChatId() {
        return this.chatId;
    }

    public getIsConnected() {
        return this.isConnected;
    }

    public async connect(): Promise<boolean> {
        return new Promise(async resolve => {
            this.connectionStream = chatService.connect(this.chatId);
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