from fastapi import APIRouter, Depends, HTTPException, Response
from agents_back.db import get_db
from agents_back.models.user import User
from agents_back.types.auth import LoginDTO, RegisterDTO
import agents_back.core.security as security
from agents_back.services.auth_service import get_auth_service, AuthService

router = APIRouter(prefix="/auth")

@router.post("/login")
async def login(info: LoginDTO, response: Response, auth_service: AuthService = Depends(get_auth_service)):
    user: User|None = await auth_service.authenticate_user(info.email, info.password)

    if user is None:
        raise HTTPException(status_code=401)

    token = await auth_service.create_token_for_user(user)
    response.set_cookie(
        key="auth_token",
        value=token.access_token,
        httponly=False,
        secure=True,
        max_age=3600,
        samesite="none"
    )
    return user


@router.post("/register/")
async def register(user: RegisterDTO, response: Response, auth_service: AuthService = Depends(get_auth_service)):
    registered_user: User = await auth_service.register_user(user)
    token = await auth_service.create_token_for_user(registered_user)
    response.set_cookie(
        key="auth_token",
        value=token.access_token,
        httponly=False,
        secure=True,
        max_age=3600,
        samesite="none"
    )
    return registered_user