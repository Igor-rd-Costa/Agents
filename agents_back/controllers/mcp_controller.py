from fastapi import APIRouter, Depends

from agents_back.services.mcp_service import MCPService, get_mcp_service

router = APIRouter(prefix="/mcp")


@router.get("")
async def get_mcp_info(mcp_service: MCPService = Depends(get_mcp_service)):
    print("Getting Info")
    info = await mcp_service.get_info()
    print(f"Got Info: {info}")
    return info