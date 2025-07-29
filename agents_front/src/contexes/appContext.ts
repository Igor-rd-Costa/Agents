import React, {createContext} from "react";
import {AuthService, authService} from "@/services/AuthService";
import chatService, {ChatService} from "@/services/ChatService";
import mcpService, {MCPService} from "@/services/MCPService";
import {User} from "@/types/auth";
import {Chat} from "@/types/chat";
import {SideMenuRef} from "@/components/layouts/pageLayout/sideMenu/SideMenu";

export enum AppView {
    CHATS,
    AGENTS,
    MCP,
    CANVAS
}

type AuthContextType = {
    user: User | null,
    setUser: (user: User|null) => void,
    authService: AuthService
}


type ViewContextType = {
    view: AppView,
    setView: (view: AppView) => void
}

type ChatContextType = {
    chat: Chat,
    setChat: (chat: Chat) => void,
    chatService: ChatService
}

type MCPContextType = {
    mcp: any,
    setMcp: (mcp: any) => void,
    mcpService: MCPService
}

type ComponentsContextType = {
    sideMenuRef: React.RefObject<SideMenuRef|null>,
    setSideMenuRef: (ref: React.RefObject<SideMenuRef|null>) => void
}


export type AppContextType = {
    authContext: AuthContextType,
    viewContext: ViewContextType,
    chatContext: ChatContextType,
    mcpContext: MCPContextType,
    components: ComponentsContextType
};

const defaultAppContext: AppContextType = {
    authContext: {
        user: null,
        setUser: () => {},
        authService: authService
    },
    viewContext: {
        view: AppView.CHATS,
        setView: () => {}
    },
    chatContext: {
        chat: chatService.emptyChat(),
        setChat: () => {},
        chatService
    },
    mcpContext: {
        mcp: {},
        setMcp: () => {},
        mcpService
    },
    components: {
        sideMenuRef: {current: null},
        setSideMenuRef: () => {}
    }
}

const AppContext = createContext<AppContextType>(defaultAppContext);

export default AppContext;