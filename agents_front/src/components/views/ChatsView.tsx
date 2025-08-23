import React, {useContext, useEffect, useRef, useState} from "react";
import Button from "@mui/material/Button";
import Message, {MessageSrc, MessageType} from "@/components/mainPage/Message";
import AppContext from "@/contexes/appContext";

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
        if (chat.id) {
            new Promise<void>(async (resolve) => {
               const data = await chatService.getMessages(chat.id!);
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
        const value = input.current.innerText;
        if (value === "") {
            return;
        }

        setMessage("");
        setMessages(m => [...m, {type: MessageType.MESSAGE, src: 'user', content: value}]);
        input.current.innerText = "";
        setTimeout(() => {
            if (messagesWrapper.current) {
                messagesWrapper.current.scrollTo(0, messagesWrapper.current.scrollHeight);
            }
        }, 10)
        const result = chatService.sendMessage(chat?.id ?? null, value);
        result.onData(data => {
            setMessage(m => m + data);
            setTimeout(() => {
                if (messagesWrapper.current) {
                    messagesWrapper.current.scrollTo(0, messagesWrapper.current.scrollHeight);
                }
            }, 10)
        });
        result.onError(error => {
            console.error("StreamingResponse Error", error);
        })
        result.onFinish(arg => {
            if (arg.extraData) {
                setChat(arg.extraData);
            }
            if (arg.tool) {
                arg.tool.forEach(tool => {
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
                })
            }
            setEndToggle(!endToggle);
        })
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