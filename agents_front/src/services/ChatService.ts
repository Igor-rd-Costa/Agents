import {Chat} from "@/types/chat";
import {StreamingResponse} from "@/types/http";


export class ChatService {
    private backend = "http://127.0.0.1:8000/chat"

    public emptyChat(): Chat {
        return {
            id: null,
            name: '',
            createdAt: new Date(Date.now()),
            updatedAt: new Date(Date.now())
        };
    }

    public sendMessage(chatId: string|null, message: string): StreamingResponse<Chat> {
        return new StreamingResponse<Chat>(this.backend, 'POST', JSON.stringify({id: chatId, message}));
    }
}

const chatService = new ChatService();

export default chatService