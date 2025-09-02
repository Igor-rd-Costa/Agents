import React, {useContext, useEffect, useRef, useState} from "react";
import Message, {MessageSrc, MessageType} from "@/components/mainPage/Message";
import AppContext from "@/contexes/appContext";
import {Chat} from "@/types/chat/Chat"
import {ToolCall} from "@/types/http";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import { Dashboard } from "@/types/dashboard";
import EditIcon from "@mui/icons-material/Edit"

type MessageDTO = {
    type: MessageType,
    src: MessageSrc,
    content: string
}

export default function ChatView() {
    const { dashboardContext, components } = useContext(AppContext);
    const { dashboard, setDashboard, dashboardService } = dashboardContext;

    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState<MessageDTO[]>([]);
    const [inputValue, setInputValue] = useState('');
    const input = useRef<HTMLDivElement>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const messagesWrapper = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (dashboard.getId()) {
            new Promise<void>(async (resolve) => {
               const data = await dashboardService.getMessages(dashboard.getId()!);
               setMessages(data.messages);
               resolve();
            }).then(() => {});
        } else {
            setMessages([]);
            setMessage("");
        }
    }, []);

    const onSubmit = async () => {
        if (!input.current) {
            return;
        }
        const value = input.current.innerText.trim();
        if (value === "") {
            return;
        }

        const chatConnection = dashboard.getConnection();

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
                                if (tool.name === 'dashboard-build' && tool.args['html'] && components.activeViewRef.current) {
                                    components.activeViewRef.current.setHtmlElement(tool.args['html'])
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
                const dashboardDTO = extraData.chat;
                
                if (dashboardDTO) {
                    dashboardDTO.createdAt = new Date(dashboardDTO.createdAt);
                    dashboardDTO.updatedAt = new Date(dashboardDTO.updatedAt);
                    const { id, name, createdAt, updatedAt } = dashboardDTO;
                    setDashboard(new Dashboard(id, name, createdAt, updatedAt, chatConnection));
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

    const onInput = () => {
        setInputValue(input.current?.innerText?.trim() ?? '');
    }

    const renameDashboard = () => {

    }

    return (
        <div ref={wrapperRef} className="h-full w-full overflow-hidden relative overflow-y-hidden grid grid-rows-[auto_1fr_auto] justify-items-center pt-0 gap-8">
            <div className="font-mono flex justify-items-center gap-x-1">
                {dashboard.getId() !== null && (
                    <>
                        {dashboard.getName()}
                        <button onClick={renameDashboard} className="w-[24px] h-[24px]">
                            <EditIcon className="hover:text-white cursor-pointer" fontSize="small"/>
                        </button>
                    </>
                )}
            </div>
            <div ref={messagesWrapper} className="overflow-y-scroll gap-y-4 flex flex-col w-[95%] p-2 pt-8">
                {messages.map((m, i) => {                    
                    return <Message key={i} type={m.type} icon={m.src} content={m.content}/>
                    }
                )}
                {message !== "" ? <Message type={MessageType.MESSAGE} icon="agent" content={message}/> : <></>}
            </div>
            <div className="h-[8rem] p-3 w-full items-center">
                <form onSubmit={async (e) => {
                    e.preventDefault();
                    await onSubmit();
                }} className="w-full h-full">
                    <div className="relative border border-primary bg-[#252525] rounded-md w-full h-full text-gray-200">
                        <div ref={input} className="w-full overflow-y-scroll h-full p-1 pl-2 pr-2 outline-none break-all shadow-[inset_0px_0px_6px_2px_#111] rounded-md text-[0.9rem]"
                    onKeyDown={onKeyDown} onInput={onInput} contentEditable="true"></div>
                        <button type="submit" className="bg-primary w-[32px] h-[32px] rounded-md text-background absolute bottom-1 right-1 cursor-pointer hover:bg-primaryLight disabled:hidden"
                        disabled={inputValue === ''}>
                            <ArrowUpwardIcon/>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}