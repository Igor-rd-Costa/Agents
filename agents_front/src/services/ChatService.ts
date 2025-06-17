import {Chat} from "@/types/chat";


export class ChatService {


    public emptyChat(): Chat {
        return {
            id: '',
            name: '',
            createdAt: new Date(Date.now()),
            updatedAt: new Date(Date.now())
        };
    }
}

const chatService = new ChatService();

export default chatService