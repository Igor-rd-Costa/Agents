import EditNoteIcon from "@mui/icons-material/EditNote";
import React, { useContext, useEffect, useState } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import DescriptionIcon from "@mui/icons-material/Description";
import AppContext, { AppView } from "@/contexes/appContext";
import { ChatDTO } from "@/types/chat/ChatDTO";
import { Chat } from "@/types/chat/Chat";

export function TalksChildren() {
    const { chatContext, viewContext } = useContext(AppContext);
    const [ chats, setChats ] = useState<ChatDTO[]>([]);

    useEffect(() => {
        if (viewContext.view === AppView.CHATS) {
            chatContext.chatService.getChats().then(c => {
                setChats(c)
            });
        }
    }, [viewContext.view]);

    useEffect(() => {
        if (chatContext.chat.getId() !== null && chats.filter(c => c.id === chatContext.chat.getId()).length === 0) {
            setChats([...chats, chatContext.chat.toChatDTO()]);
        }
    }, [chatContext.chat]);

    const newChat = () => {
        chatContext.setChat(new Chat());
    }

    const openChat = (chat: ChatDTO) => {
        if (chatContext.chat.getId() === chat.id) {
            return;
        }
        const id = chat.id;
        const name = chat.name;
        const createdAt = chat.createdAt;
        const updatedAt = chat.updatedAt;
        chatContext.setChat(new Chat(id, name, createdAt, updatedAt));
    }

    const deleteChat = async (chat: ChatDTO) => {
        const chatId = chat.id;

        if (!chatId) {
            return false;
        }

        if (await chatContext.chatService.deleteChat(chatId)) {
            setChats(chats.filter(c => c.id !== chatId));
            if (chatContext.chat.getId() === chatId) {
                chatContext.setChat(new Chat());
            }
            return true;
        }

        return false;
    }

    const onMouseEnter = (event: React.MouseEvent) => {
        if (!event.target) {
            return;
        }

        const target =event.target as HTMLElement;
        const deleteButton = target.querySelector(".side-menu-chat-delete-icon");

        if (deleteButton) {
            (deleteButton as HTMLElement).style.opacity = '1';
        }

    }

    const onMouseLeave = (event: React.MouseEvent) => {
        if (!event.target) {
            return;
        }

        const target =event.target as HTMLElement;
        const deleteButton = target.querySelector(".side-menu-chat-delete-icon");

        if (deleteButton) {
            (deleteButton as HTMLElement).style.opacity = '0';
        }
    }

    return (
        <div className="h-fit w-full grid grid-cols-1 grid-rows-[auto_1fr]">
            <button onClick={newChat} className="p-2 pl-4 grid grid-cols-[auto_1fr_24px] gap-x-2 items-center
            cursor-pointer box-border border-1 border-l-0 rounded-r-md transition-all duration-300 text-nowrap justify-self-start
            border-primary text-primary hover:border-primaryLight hover:text-primaryLight" title="Nova Conversa">
                <EditNoteIcon/> Nova Conversa
            </button>

            {chats.length > 0 ? (
            <div className="mt-8 h-full">
                <h4 className="text-[0.9rem] text-[#AAA] pl-2 text-nowrap">Conversas Recentes</h4>
                <div className="flex flex-col gap-y-2 pr-[7%] text-[#EEE] w-full h-[490px] overflow-y-scroll mt-2">
                    {chats.map((c) => (
                        <div key={c.id} style={chatContext.chat.getId() === c.id ? {color: 'var(--color-primary)', borderColor: 'var(--color-primary)'} : {}}
                        className="p-2 pl-5 grid grid-cols-[auto_1fr_24px] gap-x-2 h-[44px] items-center cursor-pointer box-border border-1 border-l-0 border-transparent rounded-r-md
                        hover:border-primary hover:text-primary transition-all duration-300" title={c.name}
                        onClick={() => {openChat(c)}} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
                            <DescriptionIcon fontSize="small"/>
                            <span className="truncate w-full">{c.name}</span>
                            <div title="Deletar Conversa">
                                <DeleteIcon onClick={async (e: React.MouseEvent) => {
                                    e.stopPropagation();
                                    await deleteChat(c);
                                }} className="side-menu-chat-delete-icon opacity-0 text-primary hover:text-primaryLight"
                                sx={{transition: 'opacity 300ms linear'}}/>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            ) : <></>}
        </div>
    )
}