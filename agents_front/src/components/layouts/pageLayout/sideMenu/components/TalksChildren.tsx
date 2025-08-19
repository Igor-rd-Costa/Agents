import EditNoteIcon from "@mui/icons-material/EditNote";
import React, {useContext, useEffect, useState} from "react";
import {Chat} from "@/types/chat";
import chatService from "@/services/ChatService";
import DeleteIcon from "@mui/icons-material/Delete";
import DescriptionIcon from "@mui/icons-material/Description";
import AppContext, {AppView} from "@/contexes/appContext";

export function TalksChildren() {
    const { chatContext, viewContext } = useContext(AppContext);
    const [ chats, setChats ] = useState<Chat[]>([]);

    useEffect(() => {
        if (viewContext.view === AppView.CHATS) {
            chatContext.chatService.getChats().then(c => {
                setChats(c)
            });
        }
    }, [viewContext.view]);

    useEffect(() => {
        if (chatContext.chat.id !== null && chats.filter(c => c.id === chatContext.chat.id).length === 0) {
            setChats([...chats, chatContext.chat]);
        }
    }, [chatContext.chat]);

    const newChat = () => {
        chatContext.setChat(chatService.emptyChat());
    }

    const openChat = (chat: Chat) => {
        if (chatContext.chat.id === chat.id) {
            return;
        }
        chatContext.setChat(chat);
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
        <>
            <button onClick={newChat} className="p-2 pl-4 grid grid-cols-[auto_1fr_24px] gap-x-2 items-center
            cursor-pointer box-border border-1 border-l-0 rounded-r-md transition-all duration-300
            border-primary text-primary hover:border-primaryLight hover:text-primaryLight" title="Nova Conversa">
                <EditNoteIcon/> Nova Conversa
            </button>

            {chats.length > 0 ? (
            <div className="mt-8">
                <h4 className="text-[0.9rem] text-[#AAA]">Conversas Recentes</h4>
                <div className="grid gap-y-2 pr-[5%] text-[#EEE] w-full mt-2">
                    {chats.map((c) => (
                        <div key={c.id} style={chatContext.chat.id === c.id ? {color: 'var(--color-primary)', borderColor: 'var(--color-primary)'} : {}}
                        className="p-2 pl-4 grid grid-cols-[auto_1fr_24px] gap-x-2 items-center cursor-pointer box-border border-1 border-l-0 border-transparent rounded-r-md
                        hover:border-primary hover:text-primary transition-all duration-300" title={c.name}
                        onClick={() => {openChat(c)}} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
                            <DescriptionIcon fontSize="small"/>
                            <span className="truncate w-full">{c.name} AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA</span>
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
        </>
    )
}