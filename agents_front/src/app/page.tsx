'use client'
import Button from "@mui/material/Button";
import axios from "axios";
import {useRef, useState} from "react";

export default function Home() {
    const [message, setMessage] = useState("");
    const input = useRef<HTMLTextAreaElement>(null);
    const onSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!input.current) {
            return;
        }
        const value = input.current.value;
        const {status, data} = await axios.post<string>("http://127.0.0.1:8000/agents", {query: value}, {withCredentials: true});
        if (status === 200) {
            setMessage(data);
        }
    }

    return (
        <div className="w-full h-full grid grid-cols-[auto_1fr] grid-rows-[1fr_auto] p-4 gap-4">
            <div className="w-[15rem] border border-primary rounded-md">

            </div>
            <div>
                {message}
            </div>
            <div>

            </div>
            <form onSubmit={onSubmit} className="h-[8rem] grid grid-cols-[1fr_auto] gap-4 items-center">
                <textarea ref={input} className="border border-primary rounded-md h-full p-1 pl-2 pr-2 outline-none">
                </textarea>
                <Button type="submit" variant={'contained'}>Send</Button>
            </form>
        </div>
    );
}
