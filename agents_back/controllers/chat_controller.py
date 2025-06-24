from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, Request, HTTPException
from fastapi.params import Query
from langchain_core.prompts import ChatPromptTemplate
from langchain_groq import ChatGroq
from agents_back.services.auth_service import AuthService, get_auth_service
from agents_back.services.chat_service import ChatService, get_chat_service
from agents_back.types.chat import ChatDTO, Message
from agents_back.types.general import ObjectId
from agents_back.utils.agents import chat_messages_to_agent_message
from agents_back.utils.responses import stream_llm_response

router = APIRouter(prefix="/chat")


@router.post("")
async def chat(chat: ChatDTO, request: Request,
               chat_service: ChatService = Depends(get_chat_service),
               auth_service: AuthService = Depends(get_auth_service)):
    if len(chat.message) == 0:
        raise HTTPException(status_code=400)
    user = await auth_service.get_current_user(request)
    active_chat = await chat_service.create_empty_chat(user.id) if chat.id is None else await chat_service.get_chat(chat.id, user.id)

    new_messages = [
        Message(type="user", content=chat.message, timestamp=datetime.now())
    ]
    if active_chat is None:
        active_chat = await chat_service.create_empty_chat(user.id)
        chat.id = None

    messages = [
        ("system", "Você é um assistente amigável e sua função é responder as perguntas que forem enviadas pelo usuário."),
    ]

    db_messages = await chat_service.get_messages(active_chat.id)

    message_count = len(db_messages.messages if db_messages else 0)
    for i in reversed(range(0, message_count if message_count <= 10 else 10)):
        message = db_messages.messages[i]
        messages.append(chat_messages_to_agent_message(message))

    messages.append(("user", chat.message))

    template = ChatPromptTemplate.from_messages(messages)
    llm = ChatGroq(model="llama-3.3-70b-versatile")
    chain = template | llm

    tokens = []
    async for chunk in chain.astream({}):
        if chunk.content:
            tokens.append(chunk.content)

    new_messages.append(Message(type="agent", content="".join(tokens), timestamp=datetime.now()))
    await chat_service.save_messages(active_chat.id, new_messages)

    extra_data = None
    if chat.id is None:
        extra_data = active_chat
    return stream_llm_response(tokens, extra_data if extra_data is None else extra_data.model_dump_json(by_alias=False))

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
