'use client'
import Button from "@mui/material/Button";
import Message, {MessageIcon} from "../components/mainPage/Message"
import {useContext, useEffect, useRef, useState} from "react";
import axios from "axios";
import ChatsSection from "@/components/mainPage/ChatsSection";
import ChatContext from "@/contexes/chatContext";

type MessageDTO = {
    src: MessageIcon,
    content: string
}

export default function Home() {
    const chatContext = useContext(ChatContext);
    const [message, setMessage] = useState("");
    const [endToggle, setEndToggle] = useState(false);
    const [messages, setMessages] = useState<MessageDTO[]>([]);
    const eventSourceRef = useRef<EventSource|null>(null);
    const input = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (message !== "") {
            setMessages(m => [...m, {src: 'agent', content: message}]);
            setMessage("");
        }
    }, [endToggle]);

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
        try {
            eventSourceRef.current = new EventSource(`http://localhost:8000/agents/?query=${encodeURIComponent(value)}`);

            setMessages(m => [...m, {src: 'user', content: value}]);
            eventSourceRef.current.onmessage = (event) => {
                setMessage(prev => prev + event.data);
            };

            eventSourceRef.current.onerror = (error) => {
                console.error("EventSourceError", error)
                eventSourceRef.current?.close();
            };

            eventSourceRef.current.addEventListener('end', () => {
                setEndToggle(!endToggle);
                eventSourceRef.current?.close();
            });
        } catch (error) {
            console.error('Error initiating stream:', error);
        }
    }

    const testSubmit = async () => {
        console.log("Submit");
        const {status, data} = await axios.post('http://localhost:8000/agents/');
        console.log({status, data});
    }

    const testQuery = async () => {
        console.log("Query");
        const {status, data} = await axios.get('http://localhost:8000/agents/test');
        console.log({status, data});
    }

    return (
        <div className="grid w-full h-full grid-cols-[auto_1fr]">
            <ChatsSection/>
            <div className="w-full h-full grid grid-rows-[1fr_auto] p-4 justify-items-center pt-0 pr-8 gap-8">
                <div className="overflow-y-scroll gap-y-4 flex flex-col">
                    {messages.map((m, i) =>
                        <Message key={i} icon={m.src} content={m.content}/>
                    )}
                    {message !== "" ? <Message icon="agent" content={message}/> : <></>}
                </div>
                <form onSubmit={onSubmit} className="h-[8rem] w-[65%] grid grid-cols-[1fr_auto] gap-4 items-center">
                    <textarea ref={input} className="border border-primary rounded-md h-full p-1 pl-2 pr-2 outline-none">
                    </textarea>
                    <Button type="submit" variant={'contained'}>Send</Button>
                </form>
            </div>
        </div>
    );
}
