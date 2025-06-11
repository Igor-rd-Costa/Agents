from fastapi import APIRouter,Request, Depends
from langchain_core.prompts import ChatPromptTemplate
from langchain_groq import ChatGroq
from sqlmodel import Session
from agents_back.db import get_session
from agents_back.services.auth_service import AuthService, get_auth_service
from agents_back.types.agents import Query

router = APIRouter(prefix="/agents")

@router.post("/")
async def post(query: Query, request: Request, auth_service: AuthService = Depends(get_auth_service), session: Session = Depends(get_session)):
    #user = await auth_service.get_current_user(request, session)
    template = ChatPromptTemplate.from_messages([
        ("system", "Você é um assistente amigável e sua função é responder as perguntas que forem enviadas pelo usuário."),
        ("user", "{query}")
    ])
    chat = ChatGroq(model="llama-3.3-70b-versatile")
    chain = template | chat
    return chain.invoke({"query": query.query}).content