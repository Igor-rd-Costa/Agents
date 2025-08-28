import React, {createContext} from "react";
import {AuthService, authService} from "@/services/AuthService";
import chatService, {ChatService} from "@/services/ChatService";
import mcpService, {MCPService} from "@/services/MCPService";
import {User} from "@/types/auth";
import {Chat} from "@/types/chat/Chat";
import {SideMenuRef} from "@/components/layouts/pageLayout/sideMenu/SideMenu";
import { TopPanelRef } from "@/components/layouts/pageLayout/topPanel/TopPanel";

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
    topPanelRef: React.RefObject<TopPanelRef|null>,
    setTopPanelRef: (ref: React.RefObject<TopPanelRef|null>) => void
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
        chat: new Chat(),
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
        setSideMenuRef: () => {},
        topPanelRef: {current: null},
        setTopPanelRef: () => {}
    }
}

const AppContext = createContext<AppContextType>(defaultAppContext);

export default AppContext;