import React, {useContext, useEffect, useRef, useState} from "react";
import {DashboardDTO} from "@/types/dashboard";
import AppContext, {AppView} from "@/contexes/appContext";
import Button from "@mui/material/Button";
import DashboardIcon from "@mui/icons-material/Dashboard"


export default function DashboardsView() {
    const {dashboardContext, viewContext} = useContext(AppContext);
    const [dashboards, setDashboards] = useState<DashboardDTO[]>([]);

    const dashboardNameInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        dashboardContext.dashboardService.getDashboards().then(dashboards => {
            setDashboards(dashboards);
        });
    }, []);

    const onCreateDashboard = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!dashboardNameInputRef.current) {
            return
        }
        const nameInput = dashboardNameInputRef.current;
        const name = nameInput.value.trim();
        if (name === '') {
            return;
        }

        const dashboard = await dashboardContext.dashboardService.createDashboard(name);
    }

    const loadDashboard = (dashboard: DashboardDTO) => {
        dashboardContext.setDashboard(dashboard);
        viewContext.setView(AppView.CHAT);
    }

    return (
        <div className="grid gap-y-4">
            <form onSubmit={onCreateDashboard} className="rounded-md text-[0.9rem] p-2 pl-2 pr-2 grid gap-y-2">
                <h3 className="text-gray-300">Create Dashboard</h3>
                <div className="grid">
                    <label className="text-gray-300">Name</label>
                    <input ref={dashboardNameInputRef} className="outline-none rounded-md bg-[#444] w-[15rem] pl-2 pr-2" type="text"/>
                </div>
                <Button className="justify-self-start" type="submit" size="small" variant="contained">Create</Button>
            </form>
            <h2 className="text-primary">Dashboards</h2>


            {dashboards.map((dashboard) => {
                return (
                    <div onClick={() => {
                        loadDashboard(dashboard);
                    }} key={dashboard.id} className="w-fit h-fit text-[#DDD] flex items-center gap-x-1 cursor-pointer
                    select-none hover:text-white">
                        <DashboardIcon sx={{fontSize: '2rem'}}/> {dashboard.name}
                    </div>
                )
            })

            }
        </div>
    )
}