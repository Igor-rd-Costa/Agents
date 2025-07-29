'use client'
import Button from "@mui/material/Button";
import {useContext, useEffect, useState} from "react";
import AppContext from "@/contexes/appContext";

export default function MCPView() {
    const { mcpContext } = useContext(AppContext);
    const { mcpService } = mcpContext;
    const [tools, setTools] = useState<any[]>([]);

    useEffect(() => {

    }, []);

    const test = async () => {
        const result = await mcpService.test();
        console.log("Result", result);
    }

    return (
        <div className="grid grid-rows-[1fr_30%] grid-cols-1 items-center justify-items-center w-full h-full">
            <div>

            </div>
            <Button variant="contained" onClick={test}>Test</Button>
        </div>
    )
}