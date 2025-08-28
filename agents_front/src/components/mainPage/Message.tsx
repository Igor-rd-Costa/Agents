import SmartToy from "@mui/icons-material/SmartToy"
import Person from "@mui/icons-material/Person"
import { CSSProperties, useContext } from "react";
import { ToolCall } from "@/types/http";
import HardwareIcon from "@mui/icons-material/Hardware"
import AppContext from "@/contexes/appContext";

export enum MessageType {
    MESSAGE = 0,
    TOOL_CALL = 1
}

export type MessageSrc = 'agent' | 'user';

export type MessageProps = {
    type: MessageType,
    icon: MessageSrc,
    content: string|ToolCall[]
}

export default function Message({type, icon, content}: MessageProps) {
    const { components } = useContext(AppContext);
    const messageStyle: CSSProperties = {gridTemplateColumns: '3.2rem 1fr 3.2rem'};
    const iconStyle: CSSProperties = {gridColumn: 1};
    const contentStyle: CSSProperties = {gridColumn: 2, borderTopLeftRadius: 0};
    if (icon !== 'agent') {
        iconStyle.gridColumn = 3;
        contentStyle.justifySelf = 'end';
        contentStyle.borderTopLeftRadius = undefined;
        contentStyle.borderTopRightRadius = 0;
    }

    const isGraphicToolCall = type === MessageType.TOOL_CALL && typeof content !== 'string';
    if (isGraphicToolCall && content[0] && content[0].name && content[0].name !== "message") {
        if (content[1] && content[1].name !== "message") {
            return;
        }
        const temp = content[0];
        content[0] = content[1];
        content[1] = temp;
    }
    let tool_info: null | {message: string, tool_call: ToolCall} = null;
    if (isGraphicToolCall) {
        tool_info = {
            message: content[0] ? '' + (content[0].args['msg'] ?? '') : '',
            tool_call: content[1] ?? content[0]
        };
    }
    const tool = tool_info?.tool_call;
    const showToolInfo = () => {
        if (!isGraphicToolCall || !tool || tool.namespace !== 'agnt') {
            return;
        }
        if (tool.name === 'canvas-show' && tool.args['svg']) {
            components.sideMenuRef.current?.canvas.show(tool.args['svg']);
        }
        if (tool.name == 'dashboard-build' && tool.args['html']) {
            components.topPanelRef.current?.setHtmlElement(tool.args['html']);
        }
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
                {isGraphicToolCall ?
                    (<div className="flex items-center gap-x-4">
                        <HardwareIcon className="cursor-pointer hover:text-primary" onClick={showToolInfo}/>
                        {tool_info?.message}
                    </div>) : (content as string)
                }
            </div>
        </div>
    );
}