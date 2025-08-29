import React, {useContext, useEffect, useRef, useState} from "react";
import Button from "@mui/material/Button";
import Message, {MessageSrc, MessageType} from "@/components/mainPage/Message";
import AppContext from "@/contexes/appContext";
import {Chat} from "@/types/chat/Chat"
import {ToolCall} from "@/types/http";
import { KeyboardArrowLeft, KeyboardArrowRight } from "@mui/icons-material";

type MessageDTO = {
    type: MessageType,
    src: MessageSrc,
    content: string
}

export default function ChatsView() {
    const { chatContext, components } = useContext(AppContext);
    const { chat, setChat, chatService } = chatContext;
    const [message, setMessage] = useState("");
    const [endToggle, setEndToggle] = useState(false);
    const [messages, setMessages] = useState<MessageDTO[]>([]);
    const messagesWrapper = useRef<HTMLDivElement>(null);
    const [isExpanded, setIsExpanded] = useState<boolean>(true);
    const input = useRef<HTMLDivElement>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (message !== "") {
            setMessages(m => [...m, {type: MessageType.MESSAGE, src: 'agent', content: message}]);
            setMessage("");
        }
    }, [endToggle]);

    useEffect(() => {
        if (chat.getId()) {
            new Promise<void>(async (resolve) => {
               const data = await chatService.getMessages(chat.getId()!);
               setMessages(data.messages);
               resolve();
            }).then(() => {});
        } else {
            setMessages([]);
            setMessage("");
        }
    }, [chat]);

    const onSubmit = async () => {
        if (!input.current) {
            return;
        }
        const value = input.current.innerText.trim();
        if (value === "") {
            return;
        }

        const chatConnection = chat.getConnection();

        if (!chatConnection.getIsConnected()) {
            console.log("Not connected!");
            if (!await chatConnection.connect()) {
                return;
            }
            console.log("Connected!");
        }

        setMessage("");
        setMessages(m => [...m, {type: MessageType.MESSAGE, src: 'user', content: value}]);
        input.current.innerText = "";
        setTimeout(() => {
            if (messagesWrapper.current) {
                messagesWrapper.current.scrollTo(0, messagesWrapper.current.scrollHeight);
            }
        }, 10)

        await chatConnection.sendMessage(value, (message => {
            const data = message.getData();
            const msg = data?.data;
            const extraData = data?.chat;
            if (msg) {
                console.log("Got message", data);
                if (data?.messageType === MessageType.MESSAGE) {
                    setMessages(m => [...m, {type: MessageType.MESSAGE, src: 'agent', content: msg as string}]);
                } else {
                    (msg as ToolCall[]).forEach(tool => {
                        if (tool.name && tool.namespace) {
                            if (tool.namespace === 'agnt') {
                                if (tool.name === 'canvas-show' && tool.args['svg'] && components.sideMenuRef.current) {
                                    components.sideMenuRef.current.canvas.show(tool.args['svg']);
                                }
                                if (tool.name === 'dashboard-build' && tool.args['html'] && components.topPanelRef.current) {
                                    components.topPanelRef.current.setHtmlElement(tool.args['html'])
                                }
                                if (tool.name === 'message' && tool.args['msg']) {
                                    setMessages([
                                        ...messages,
                                        { type: MessageType.TOOL_CALL, src: 'agent', content: tool.args['msg'] }
                                    ]);
                                }
                            }
                        }
                    });
                }
            }
            if (extraData) {
                const chatDTO = extraData.chat;
                
                if (chatDTO) {
                    chatDTO.createdAt = new Date(chatDTO.createdAt);
                    chatDTO.updatedAt = new Date(chatDTO.updatedAt);
                    setChat(new Chat(
                        chatDTO.id,
                        chatDTO.name,
                        chatDTO.createdAt,
                        chatDTO.updatedAt,
                        chatConnection
                    ));
                }
            }
        }));
    }

    const onKeyDown = async (event: React.KeyboardEvent) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            await onSubmit();
        }
    }

    const toggleExpand = (e: React.MouseEvent) => {
        e.stopPropagation();
        const wrapper = wrapperRef.current;
        if (!wrapper) {
            return;
        }

        const start = wrapper.getBoundingClientRect().width + 'px';
        const end = isExpanded ? '48px' : '400px';

        wrapper.animate([{width: start}, {width: end}], {duration: 500, fill: 'forwards'})
        .addEventListener('finish', () => {
            setIsExpanded(!isExpanded);
        });

        const children = wrapper.children;
        const opEnd = isExpanded ? 0 : 1;
        const newDisplay = isExpanded ? 'none' : '';
        if (!isExpanded) {
            for (let i = 1; i < children.length; i++) {
                (children[i] as HTMLElement).style = newDisplay;
            }
        }
        for (let i = 1; i < children.length; i++) {
            children[i].animate([{opacity: getComputedStyle(children[i]).opacity}, {opacity: opEnd}], {duration: 300, fill: 'forwards'})
            .addEventListener('finish', () => {
                (children[i] as HTMLElement).style.display = newDisplay;
            })
        }
    }

    const testConnection = () => {
        const chatConnection = chat.getConnection();
        console.log(chatConnection.testConnection());
    }

    return (
        <div ref={wrapperRef} className="h-full w-[400px] overflow-hidden relative overflow-y-hidden grid grid-rows-[1fr_auto] pb-4 justify-items-center pt-0 gap-8">
            <div className="absolute z-[1] left-0 cursor-pointer w-[48px] h-[48px] flex items-center justify-center hover:text-white"
            onClick={toggleExpand}>
                {isExpanded
                    ? <KeyboardArrowRight className="w-[24px] h-[24px]" sx={{fontSize: '28px'}}/>
                    : <KeyboardArrowLeft className="w-[24px] h-[24px]" sx={{fontSize: '28px'}}/> 
                }
            </div>
            <div ref={messagesWrapper} className="overflow-y-scroll gap-y-4 flex flex-col w-[380px] p-2 pt-8">
                {messages.map((m, i) => {                    
                    return <Message key={i} type={m.type} icon={m.src} content={m.content}/>
                    }
                )}
                {message !== "" ? <Message type={MessageType.MESSAGE} icon="agent" content={message}/> : <></>}
            </div>
            <form onSubmit={async (e) => {
                e.preventDefault();
                await onSubmit();
            }} className="h-[8rem] pl-2 pr-2 w-full grid grid-cols-[1fr_auto] gap-4 items-center">
                <div ref={input} className="border border-primary w-[300px] overflow-y-scroll rounded-md h-full p-1 pl-2 pr-2 w-full outline-none"
                 onKeyDown={onKeyDown} contentEditable="true">
                </div>
                <Button type="submit" variant={'contained'}>Send</Button>
                <Button onClick={testConnection} type="button" variant={'contained'}>Test Connection</Button>
            </form>
        </div>
    )
}