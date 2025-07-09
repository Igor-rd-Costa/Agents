import EditNote from "@mui/icons-material/EditNote"
import Menu from "@mui/icons-material/Menu"
import {useContext, useEffect, useRef, useState} from "react";
import ChatContext from "@/contexes/chatContext";
import chatService from "@/services/ChatService";
import ChatIcon from "@mui/icons-material/Chat";
import DeleteIcon from "@mui/icons-material/Delete"
import {Chat} from "@/types/chat";

export default function ChatsSection() {
    const chatContext = useContext(ChatContext)
    const [chats, setChats] = useState<Chat[]>([]);
    const isExpanded = useRef<boolean>(true);
    const section = useRef<HTMLElement>(null);
    const menuAnimation = useRef<Animation|null>(null);

    useEffect(() => {
        chatContext.chatService.getChats().then(c => {
            setChats(c)
        });
    }, []);

    useEffect(() => {
        if (chatContext.chat.id !== null && chats.filter(c => c.id === chatContext.chat.id).length === 0) {
            setChats([...chats, chatContext.chat]);
        }
    }, [chatContext.chat]);

    const newChat = () => {
        chatContext.setChat(chatService.emptyChat());
    }

    const toggleExpand = () => {
        if (!section.current) {
            return;
        }

        const currentWidth = section.current.getBoundingClientRect().width;
        const newWidth = isExpanded.current ? 48 : 256;
        if (menuAnimation.current) {
            menuAnimation.current.cancel();
        }

        isExpanded.current = !isExpanded.current;
        menuAnimation.current = section.current.animate(
            [{width: `${currentWidth}px`}, {width: `${newWidth}px`}],
            {duration: 200, fill: 'forwards'}
        );

        menuAnimation.current.addEventListener('finish', () => {
            menuAnimation.current?.commitStyles();
            menuAnimation.current = null;
        });
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
        <section ref={section} className="h-full w-[256px] bg-[#151515] p-3 pt-4">
            <div>
                <button type="button" className="hover:white cursor-pointer" onClick={toggleExpand}>
                    <Menu/>
                </button>
            </div>
            <div className="mt-12 overflow-hidden text-nowrap">
                <button onClick={newChat} type="button" className="flex gap-x-2 hover:text-white cursor-pointer">
                    <EditNote/> Nova Conversa
                </button>
                { chats.length > 0 ? (
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
            </div>
        </section>
    );
}