import axios from "axios";


export class MCPService {
    private readonly backend = "http://127.0.0.1:8000/mcp"

    async test() {
        return await axios.get(this.backend, {withCredentials: true});
    }
}

const mcpService = new MCPService();
export default mcpService;