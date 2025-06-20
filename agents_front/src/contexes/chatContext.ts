import {createContext} from "react";
import {Chat} from "@/types/chat";
import chatService, {ChatService} from "@/services/ChatService";

export type ChatContextType = {
    chat: Chat|null,
    setChat: (chat: Chat|null) => void,
    chatService: ChatService
}

const ChatContext = createContext<ChatContextType>({
    chat: chatService.emptyChat(),
    setChat: () => {},
    chatService
});

export default ChatContext;