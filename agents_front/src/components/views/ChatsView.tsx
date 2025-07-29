import React, {useContext, useEffect, useRef, useState} from "react";
import Button from "@mui/material/Button";
import Message, {MessageType} from "@/components/mainPage/Message";
import AppContext from "@/contexes/appContext";

type MessageDTO = {
    type: MessageType,
    content: string
}

export default function ChatsView() {
    const { chatContext, components } = useContext(AppContext);
    const { chat, setChat, chatService } = chatContext;
    const [message, setMessage] = useState("");
    const [endToggle, setEndToggle] = useState(false);
    const [messages, setMessages] = useState<MessageDTO[]>([]);
    const messagesWrapper = useRef<HTMLDivElement>(null);
    const input = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (message !== "") {
            setMessages(m => [...m, {type: 'agent', content: message}]);
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

    const onSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!input.current) {
            return;
        }
        const value = input.current.value;
        if (value === "") {
            return;
        }

        setMessage("");
        setMessages(m => [...m, {type: 'user', content: value}]);
        input.current.value = "";
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
                                    { type: 'agent', content: tool.args['msg']}
                                ]);
                            }
                        }
                    }
                })
            }
            setEndToggle(!endToggle);
        })
    }

    return (
        <div className="h-full w-full overflow-y-hidden grid grid-rows-[1fr_auto] p-4 justify-items-center pt-0 pr-8 gap-8">
            <div ref={messagesWrapper} className="overflow-y-scroll gap-y-4 flex flex-col w-[90%] p-2 pt-8">
                {messages.map((m, i) => {
                    return <Message key={i} icon={m.type} content={m.content}/>
                    }
                )}
                {message !== "" ? <Message icon="agent" content={message}/> : <></>}
            </div>
            <form onSubmit={onSubmit} className="h-[8rem] w-[65%] grid grid-cols-[1fr_auto] gap-4 items-center">
                <textarea ref={input} className="border border-primary rounded-md h-full p-1 pl-2 pr-2 outline-none">
                </textarea>
                <Button type="submit" variant={'contained'}>Send</Button>
            </form>
        </div>
    )
}