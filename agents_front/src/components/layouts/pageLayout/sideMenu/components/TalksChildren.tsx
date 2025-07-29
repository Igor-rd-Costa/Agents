import EditNoteIcon from "@mui/icons-material/EditNote";
import {useContext, useState} from "react";
import {Chat} from "@/types/chat";
import chatService from "@/services/ChatService";
import ChatIcon from "@mui/icons-material/Chat";
import DeleteIcon from "@mui/icons-material/Delete";
import AppContext from "@/contexes/appContext";

export function TalksChildren() {
    const { chatContext } = useContext(AppContext)
    const [chats, setChats] = useState<Chat[]>([]);

    const newChat = () => {
        chatContext.setChat(chatService.emptyChat());
    }

    const deleteChat = async (chat: Chat) => {
        if (!chat.id) {
            return false;
        }
        if (await chatContext.chatService.deleteChat(chat.id)) {
            setChats(chats.filter(c => c.id !== chat.id));
            if (chatContext.chat.id === chat.id) {
                chatContext.setChat(chatService.emptyChat());
            }
            return true;
        }
        return false;
    }

    return (
        <>
            <button onClick={newChat} type="button" className="flex gap-x-2 hover:text-white cursor-pointer">
                <EditNoteIcon/> Nova Conversa
            </button>

            {chats.length > 0 ? (
            <div className="mt-8">
                <h4 className="text-[0.9rem] text-[#AAA]">Conversas Recentes</h4>
                <div className="mt-2 grid gap-y-1">
                    {chats.map((c, i) => (
                        <button type="button" key={i} className="hover:bg-[#FFF2] hover:text-white rounded-md p-2
                        cursor-pointer flex items-center gap-x-2" onClick={() => {
                            chatContext.setChat(c)
                        }}>
                            <ChatIcon fontSize="small"/>
                            <span className="w-full flex">{c.name}</span>
                            <DeleteIcon onClick={async (e: React.MouseEvent) => {
                                e.stopPropagation();
                                await deleteChat(c);
                            }} className="text-[#DDD] hover:text-[#FFF]"/>
                        </button>
                    ))}
                </div>
            </div>
            ) : <></>}
        </>
    )
}