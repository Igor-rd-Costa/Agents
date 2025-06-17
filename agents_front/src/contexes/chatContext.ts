import {createContext} from "react";
import {Chat} from "@/types/chat";
import chatService from "@/services/ChatService";

export type ChatContextType = {
    chat: Chat,
    setChat: (chat: Chat|null) => void
}

const ChatContext = createContext<ChatContextType>({
    chat: chatService.emptyChat(),
    setChat: () => {}
});

export default ChatContext;