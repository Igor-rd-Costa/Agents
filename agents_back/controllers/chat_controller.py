from agents_back.middleware.request_middleware import request_context
from agents_back.services.dashboard_service import DashboardService, get_dashboard_service
from agents_back.utils.utils import Services, services_context
from fastapi import APIRouter, Depends, Request, HTTPException
from agents_back.services.auth_service import AuthService, get_auth_service
from starlette.responses import StreamingResponse
from agents_back.types.sse import SSEMessage, SSEEvent
from agents_back.utils.http import build_connection_id, active_connections, start_connection, process_message

router = APIRouter(prefix="/chat")

@router.post("")
async def chat(message: SSEMessage,
               request: Request,
               auth_service: AuthService = Depends(get_auth_service),
               dashboard_service: DashboardService = Depends(get_dashboard_service)):

    services_context.set(Services(
        auth_service=auth_service,
        dashboard_service=dashboard_service,
        request=request_context.get()
    ))

    if message.event == SSEEvent.CONNECTED:
        connection_id = await build_connection_id(message, auth_service, request)

        if connection_id in active_connections:
            raise HTTPException(status_code=409)

        headers = {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
        }

        return StreamingResponse(
            start_connection(connection_id),
            media_type="text/event-stream",
            headers=headers,
        )

    if not await process_message(message, auth_service, request):
        raise HTTPException(status_code=404)

    return ""