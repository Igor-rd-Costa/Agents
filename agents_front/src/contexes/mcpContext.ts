import { createContext } from "react";
import mcpService, { MCPService } from "@/services/MCPService";

export type MCPContextType = {
    mcp: any,
    setMcp: (mcp: any) => void,
    mcpService: MCPService
}

const MCPContext = createContext<MCPContextType>({
    mcp: {},
    setMcp: () => {},
    mcpService
});

export default MCPContext;