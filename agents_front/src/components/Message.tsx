import SmartToy from "@mui/icons-material/SmartToy"
import Person from "@mui/icons-material/Person"
import CopyAll from "@mui/icons-material/CopyAll"
import {CSSProperties} from "react";

export type MessageIcon = 'agent' | 'user'

export type MessageProps = {
    icon: MessageIcon,
    content: string
}

export default function Message({icon, content}: MessageProps) {
    const messageStyle: CSSProperties = {gridTemplateColumns: '3.2rem 1fr 3.2rem'};
    const iconStyle: CSSProperties = {gridColumn: 1};
    const contentStyle: CSSProperties = {gridColumn: 2, borderTopLeftRadius: 0};
    if (icon !== 'agent') {
        iconStyle.gridColumn = 3;
        contentStyle.justifySelf = 'end';
        contentStyle.borderTopLeftRadius = undefined;
        contentStyle.borderTopRightRadius = 0;
    }

    return (
        <div style={messageStyle} className={`grid grid-rows-1 gap-x-4 font-mono`}>
            <div style={{...iconStyle}} className="w-[3.2rem] h-[3.2rem] row-start-1 rounded-full border-2 border-primary flex items-center justify-center">
                { icon === 'agent'
                    ? <SmartToy fontSize="large" color="primary"/>
                    : <Person fontSize="large" color="primary"/>
                }
            </div>
            <div style={contentStyle} className="h-fit mt-6 p-2 pl-4 pr-4 text-[0.9rem] row-start-1 bg-[#202020FF] rounded-md shadow-[2px_2px_4px_1px_#FFF2]">
                {content}
            </div>
        </div>
    );
}