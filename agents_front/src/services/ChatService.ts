import {Chat} from "@/types/chat";
import {StreamingResponse} from "@/types/http";
import axios from "axios";


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

    public async getChats(): Promise<Chat[]> {
        const {data, status} = await axios.get(`${this.backend}`, {withCredentials: true});
        return data;
    }

    public async getMessages(chatId: string) {
        console.log("Getting messages for", chatId);
        const {data, status} = await axios.get(`${this.backend}/${chatId}/messages`, {withCredentials: true});
        console.log("Here", data, status);
        return data;
    }
}

const chatService = new ChatService();

export default chatService