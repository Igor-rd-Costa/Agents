'use client'
import PageLayout from "@/components/layouts/pageLayout/PageLayout";
import {useContext, useEffect, useMemo, useRef} from "react";
import AppContext, {AppView} from "@/contexes/appContext";
import AgentsView from "@/components/views/AgentsView";
import MCPView from "@/components/views/MCPView";
import DashboardView from "@/components/views/dashboardView/DashboardView";

export default function Home() {
    const { viewContext, components } = useContext(AppContext);
    const activeViewRef = useRef(null);

    useEffect(() => {
        components.setActiveViewRef(activeViewRef);
    }, []);

    const ActiveView = useMemo(() => {
        switch (viewContext.view) {
            case AppView.CHAT:
            case AppView.CANVAS:
            case AppView.DASHBOARDS: return DashboardView
            case AppView.AGENTS: return AgentsView
            case AppView.MCP: return MCPView
        }
    }, [viewContext.view]);

    return (
        <PageLayout>
            <ActiveView ref={activeViewRef}/>
        </PageLayout>
    );
}
