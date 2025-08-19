'use client'
import { useContext } from "react";
import AppContext from "@/contexes/appContext";

export default function MCPView() {
    const { mcpContext } = useContext(AppContext);
    const { mcpService } = mcpContext;

    return (
        <div className="grid grid-rows-[1fr_30%] grid-cols-1 items-center justify-items-center w-full h-full">
            <div>

            </div>
        </div>
    )
}