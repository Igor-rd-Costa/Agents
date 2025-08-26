from typing import Optional
from fastapi import APIRouter, Depends, Request, HTTPException
from fastapi.params import Query
from agents_back.services.auth_service import AuthService, get_auth_service
from agents_back.services.chat_service import ChatService, get_chat_service
from agents_back.types.chat import DeleteChatDTO, ToolCall
from agents_back.types.general import ObjectId
from starlette.responses import StreamingResponse
from agents_back.types.sse import SSEMessage, SSEEvent
from agents_back.utils.http import build_connection_id, active_connections, start_connection, process_message

router = APIRouter(prefix="/chat")

@router.post("")
async def chat(message: SSEMessage,
               request: Request,
               auth_service: AuthService = Depends(get_auth_service),
               chat_service: ChatService = Depends(get_chat_service)):

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
            start_connection(connection_id, auth_service, chat_service),
            media_type="text/event-stream",
            headers=headers,
        )

    if not await process_message(message, auth_service, request):
        raise HTTPException(status_code=404)

    return ""

@router.get("")
async def get_chats(
        request: Request,
        chat_id: Optional[ObjectId] = Query(None),
        auth_service: AuthService = Depends(get_auth_service),
        chat_service: ChatService = Depends(get_chat_service)
):
    user = await auth_service.get_current_user(request)
    chats = await chat_service.get_chats(user.id) if chat_id is None else await chat_service.get_chat(chat_id, user.id)
    return chats

@router.delete("")
async def delete_chat(
        dto: DeleteChatDTO,
        request: Request,
        auth_service: AuthService = Depends(get_auth_service),
        chat_service: ChatService = Depends(get_chat_service)
):
    user = await auth_service.get_current_user(request)
    return await chat_service.delete_chat(dto.id, user.id)

@router.get("/{chat_id}/messages")
async def get_messages(
        request: Request,
        chat_id: ObjectId,
        auth_service: AuthService = Depends(get_auth_service),
        chat_service: ChatService = Depends(get_chat_service)
):
    user = await auth_service.get_current_user(request)
    chats = await chat_service.get_messages(chat_id)
    return chats
