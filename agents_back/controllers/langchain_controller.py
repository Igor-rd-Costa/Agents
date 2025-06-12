from fastapi import APIRouter,Request, Depends
from fastapi.responses import StreamingResponse
from langchain_core.prompts import ChatPromptTemplate
from langchain_groq import ChatGroq
from sqlmodel import Session
from agents_back.db import get_session
from agents_back.services.auth_service import AuthService, get_auth_service

router = APIRouter(prefix="/agents")

@router.get("/")
async def get(query: str, request: Request, auth_service: AuthService = Depends(get_auth_service), session: Session = Depends(get_session)):
    #user = await auth_service.get_current_user(request, session)
    template = ChatPromptTemplate.from_messages([
        ("system", "Você é um assistente amigável e sua função é responder as perguntas que forem enviadas pelo usuário."),
        ("user", "{query}")
    ])
    chat = ChatGroq(model="llama-3.3-70b-versatile")
    chain = template | chat

    async def generate_stream():
        async for chunk in chain.astream({"query": query}):
            if chunk.content:
                yield f"data: {chunk.content}\n\n".encode("utf-8")
        yield b"event: end\ndata: [DONE]\n\n"

    return StreamingResponse(generate_stream(), media_type="text/event-stream")