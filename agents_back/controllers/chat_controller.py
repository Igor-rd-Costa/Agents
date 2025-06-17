from datetime import datetime

from fastapi import APIRouter, Depends, Request
from agents_back.services.auth_service import AuthService, get_auth_service
from agents_back.services.chat_service import ChatService, get_chat_service
from agents_back.types.chat import ChatDTO
from agents_back.models.chat import Chat

router = APIRouter(prefix="/chat")


@router.post("/")
async def chat(chat: ChatDTO, request: Request,
               chat_service: ChatService = Depends(get_chat_service),
               auth_service: AuthService = Depends(get_auth_service)):
    user = await auth_service.get_current_user_noexcept(request)

    active_chat =  Chat.empty(user) if chat.id is None else await chat_service.get_chat(chat.id)
    