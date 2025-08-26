import React, {useContext, useEffect, useRef, useState} from "react";
import Button from "@mui/material/Button";
import Message, {MessageSrc, MessageType} from "@/components/mainPage/Message";
import AppContext from "@/contexes/appContext";
import {Chat} from "@/types/chat/Chat"
import {ToolCall} from "@/types/http";

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
    const input = useRef<HTMLDivElement>(null);

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
            const chatDTO = data?.chat;
            if (msg) {
                if (data?.messageType === MessageType.MESSAGE) {
                    setMessages(m => [...m, {type: MessageType.MESSAGE, src: 'agent', content: msg as string}]);
                } else {
                    (msg as ToolCall[]).forEach(tool => {
                        if (tool.name && tool.namespace) {
                            if (tool.namespace === 'agnt') {
                                if (tool.name === 'canvas-show' && tool.args['svg'] && components.sideMenuRef.current) {
                                    components.sideMenuRef.current.canvas.show(tool.args['svg']);
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
            if (chatDTO) {
                setChat(new Chat(
                    chatDTO.id,
                    chatDTO.name,
                    chatDTO.createdAt,
                    chatDTO.updatedAt
                ));
            }
        }));
    }

    const onKeyDown = async (event: React.KeyboardEvent) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            await onSubmit();
        }
    }

    return (
        <div className="h-full w-full overflow-y-hidden grid grid-rows-[1fr_auto] p-4 justify-items-center pt-0 pr-8 gap-8">
            <div ref={messagesWrapper} className="overflow-y-scroll gap-y-4 flex flex-col w-[90%] p-2 pt-8">
                {messages.map((m, i) => {
                    return <Message key={i} type={m.type} icon={m.src} content={m.content}/>
                    }
                )}
                {message !== "" ? <Message type={MessageType.MESSAGE} icon="agent" content={message}/> : <></>}
            </div>
            <form onSubmit={async (e) => {
                e.preventDefault();
                await onSubmit();
            }} className="h-[8rem] w-[65%] grid grid-cols-[1fr_auto] gap-4 items-center">
                <div ref={input} className="border border-primary rounded-md h-full p-1 pl-2 pr-2 outline-none"
                 onKeyDown={onKeyDown} contentEditable="true">
                </div>
                <Button type="submit" variant={'contained'}>Send</Button>
            </form>
        </div>
    )
}