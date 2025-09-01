import { backendUrl } from "@/types/http";
import axios from "axios";
import {DashboardDTO} from "@/types/dashboard";

export class DashboardService {
    private backend = `${backendUrl}dashboard`

    public async getDashboards(): Promise<DashboardDTO[]> {
        const {data} = await axios.get<DashboardDTO[]>(`${this.backend}`, {withCredentials: true});
        return data.map(dashboard => {
            dashboard.createdAt = new Date(dashboard.createdAt);
            dashboard.updatedAt = new Date(dashboard.updatedAt);
            return dashboard;
        });
    }

    public async getMessages(dashboardId: string) {
        const {data} = await axios.get(`${this.backend}/${dashboardId}/messages`, {withCredentials: true});
        return data;
    }

    public async createDashboard(name: string) {
        const {dashboard} = await axios.post(this.backend, {name}, {withCredentials: true});
        return dashboard;
    }

    public async deleteDashboard(dashboardId: string) {
        const {data} = await axios.delete(this.backend, {withCredentials: true, data: {id: dashboardId}});
        return data;
    }
}

const dashboardService = new DashboardService();

export default dashboardService;