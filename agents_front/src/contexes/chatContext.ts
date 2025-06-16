import {createContext} from "react";
import {Chat} from "@/types/chat";

export type ChatContextType = {
    chat: Chat|null,
    setChat: (chat: Chat|null) => void
}

const ChatContext = createContext<ChatContextType>({
    chat: null,
    setChat: () => {}
});

export default ChatContext;