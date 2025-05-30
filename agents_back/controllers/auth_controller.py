from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from agents_back.db import get_session
from agents_back.models.user import User
from agents_back.types.auth import LoginDTO
import agents_back.core.security as security
from agents_back.services.auth_service import get_auth_service, AuthService

router = APIRouter(prefix="/auth")

@router.post("/login")
async def login(info: LoginDTO, auth_service: AuthService = Depends(get_auth_service)):
    user: User|None = await auth_service.authenticate_user(info.email, info.password)

    if user is None:
        raise HTTPException(status_code=401)

    token = await auth_service.create_token_for_user(user)
    return token


@router.post("/register/")
async def register(user: User, auth_service: AuthService = Depends(get_auth_service)):
    registeredUser: User = await auth_service.register_user(user)
    token = await auth_service.create_token_for_user(user)
    return token