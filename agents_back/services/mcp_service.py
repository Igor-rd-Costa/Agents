from anyio import ClosedResourceError
from fastapi import Depends
from mcp import ClientSession
from mcp.client.streamable_http import streamablehttp_client
from agents_back.db import get_db

mcp_clients: list[ClientSession|None] = []

class MCPService:
    def __init__(self, db):
        self.db = db

    async def get_info(self):
        try:
            async with streamablehttp_client("http://localhost:8090/mcp") as (read_stream, write_stream, _):
                async with ClientSession(read_stream, write_stream) as session:
                    result = await session.list_tools()
                    print(result)
        except ClosedResourceError:
            print("Client connection was closed")
        except Exception as e:
            print(f"Unexpected error calling list_tools: {e}")
        return []

    @staticmethod
    async def init():
        #init
        mcp_clients.append(None)

    @staticmethod
    async def shutdown():
        #shutdown
        mcp_clients.clear()


def get_mcp_service(db = Depends(get_db)):
    return MCPService(db)