from fastapi import APIRouter, Depends, Request, HTTPException
from langchain_core.prompts import ChatPromptTemplate
from langchain_groq import ChatGroq
from starlette.responses import StreamingResponse

from agents_back.services.auth_service import AuthService, get_auth_service
from agents_back.services.chat_service import ChatService, get_chat_service
from agents_back.types.chat import ChatDTO
from agents_back.models.chat import Chat
from agents_back.utils.responses import stream_llm_response

router = APIRouter(prefix="/chat")


@router.post("/")
async def chat(chat: ChatDTO, request: Request,
               chat_service: ChatService = Depends(get_chat_service),
               auth_service: AuthService = Depends(get_auth_service)):
    if len(chat.message) is 0:
        raise HTTPException(status_code=400)
    user = await auth_service.get_current_user_noexcept(request)

    active_chat =  Chat.empty(user) if chat.id is None else await chat_service.get_chat(chat.id)

    if active_chat.id is None:
        print("Using Empty Chat")

    messages = [
        ("system", "Você é um assistente amigável e sua função é responder as perguntas que forem enviadas pelo usuário."),
        ("user", chat.message)
    ]

    message_count = len(active_chat.messages)
    for i in reversed(range(0, message_count if message_count <= 10 else 10)):
        message = active_chat.messages[i]
        messages.append((message.source, message.content))

    template = ChatPromptTemplate.from_messages(messages)
    llm = ChatGroq(model="llama-3.3-70b-versatile")
    chain = template | llm

    print("Hereeeee")
    return stream_llm_response(chain)
    