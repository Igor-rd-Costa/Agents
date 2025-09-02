import React, {useContext, useEffect, useRef, useState} from "react";
import {Dashboard, DashboardDTO} from "@/types/dashboard";
import AppContext, {AppView} from "@/contexes/appContext";
import Button from "@mui/material/Button";
import DashboardIcon from "@mui/icons-material/Dashboard";
import AddIcon from "@mui/icons-material/Add";


export default function DashboardsView() {
    const {dashboardContext, viewContext} = useContext(AppContext);
    const [dashboards, setDashboards] = useState<DashboardDTO[]>([]);

    useEffect(() => {
        dashboardContext.dashboardService.getDashboards().then(dashboards => {
            setDashboards(dashboards);
        });
    }, []);

    const onCreateDashboard = async (e: React.FormEvent) => {
        e.preventDefault();
        loadDashboard(new Dashboard());
    }

    const loadDashboard = (dashboard: Dashboard) => {
        dashboardContext.setDashboard(dashboard);
        viewContext.setView(AppView.CHAT);
    }

    return (
        <div className="grid gap-y-4">
            
            <h2 className="text-primary">Dashboards</h2>
            <button onClick={onCreateDashboard} className="w-fit flex items-center gap-x-1 cursor-pointer text-primary hover:text-primaryLight">
                <AddIcon sx={{fontSize: '2rem'}}/> New Dashboard
            </button>

            <div className="grid gap-y-2">
                {dashboards.map((dashboard) => {
                    const { id, name, createdAt, updatedAt } = dashboard;
                    return (
                        <div onClick={() => {
                            loadDashboard(new Dashboard(id, name, createdAt, updatedAt));
                        }} key={dashboard.id} className="w-fit h-fit text-[#DDD] flex items-center gap-x-1 cursor-pointer
                        select-none hover:text-white">
                            <DashboardIcon sx={{fontSize: '2rem'}}/> {dashboard.name}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}