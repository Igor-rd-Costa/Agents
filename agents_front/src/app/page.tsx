'use client'
import PageLayout from "@/components/layouts/pageLayout/PageLayout";
import {useContext, useMemo} from "react";
import AppContext, {AppView} from "@/contexes/appContext";
import ChatsView from "@/components/views/ChatsView";
import AgentsView from "@/components/views/AgentsView";
import MCPView from "@/components/views/MCPView";

export default function Home() {
    const { viewContext } = useContext(AppContext);

    const ActiveView = useMemo(() => {
        switch (viewContext.view) {
            case AppView.CANVAS:
            case AppView.CHATS: return ChatsView
            case AppView.AGENTS: return AgentsView
            case AppView.MCP: return MCPView
        }
    }, [viewContext.view]);

    return (
        <PageLayout>
            <ActiveView/>
        </PageLayout>
    );
}
