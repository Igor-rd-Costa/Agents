import SmartToy from "@mui/icons-material/SmartToy"
import Person from "@mui/icons-material/Person"
import {CSSProperties} from "react";

export type MessageIcon = 'agent' | 'user'

export type MessageProps = {
    icon: MessageIcon,
    content: string
}

export default function Message({icon, content}: MessageProps) {
    let messageStyle: CSSProperties = {gridTemplateColumns: 'auto 1fr'};
    let iconStyle: CSSProperties = {gridColumn: 1};
    let contentStyle: CSSProperties = {gridColumn: 2};
    if (icon !== 'agent') {
        messageStyle = {gridTemplateColumns: '1fr auto'};
        iconStyle = {gridColumn: 2};
        contentStyle = {gridColumn: 1, justifySelf: 'end'};
    }

    return (
        <div style={messageStyle} className={`grid grid-cols-[auto_1fr] grid-rows-1 gap-x-4 font-mono`}>
            <div style={{...iconStyle}} className="w-[3.2rem] h-[3.2rem] row-start-1 rounded-full border-2 border-primary flex items-center justify-center">
                { icon === 'agent'
                    ? <SmartToy fontSize="large" color="primary"/>
                    : <Person fontSize="large" color="primary"/>
                }
            </div>
            <div style={contentStyle} className="pt-2 text-[0.9rem] row-start-1">
                {content}
            </div>
        </div>
    );
}