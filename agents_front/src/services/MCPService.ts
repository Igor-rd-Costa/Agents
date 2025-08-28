import { backendUrl } from "@/types/http";
import axios from "axios";


export class MCPService {
    private readonly backend = `${backendUrl}mcp`

    async test() {
        return await axios.get(this.backend, {withCredentials: true});
    }
}

const mcpService = new MCPService();
export default mcpService;