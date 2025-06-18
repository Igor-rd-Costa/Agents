# agents_back/services/auth_service.py
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer
from typing import Optional
from datetime import timedelta

from agents_back.models.user import User # Your User SQLModel
from agents_back.db import get_db
from agents_back.core.security import (
    hash_password,
    verify_password,
    verify_access_token,
    create_access_token,
    TokenData,
    ACCESS_TOKEN_EXPIRE_MINUTES,
    Token, verify_access_token_noexcept
)
from agents_back.types.auth import RegisterDTO

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login") # Adjust tokenUrl to your actual login endpoint

class AuthService:
    def __init__(self, db = Depends(get_db)):
        self.db = db

    async def register_user(self, info: RegisterDTO) -> User:
        existing_user = await self.db["users"].find_one({"normalizedEmail": info.email.upper()})

        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
            )

        hashed_password = hash_password(info.password)
        db_user = {
            "username": info.username,
            "email": info.email,
            "normalizedEmail": info.email.upper(),
            "password": hashed_password
        }

        result = await self.db["users"].insert_one(db_user)
        db_user["id"] = result.inserted_id
        return User(**db_user)

    async def authenticate_user(self, email: str, password: str) -> Optional[User]:
        user = await self.db["users"].find_one({"normalizedEmail": email.upper()})
        print(f"got User: {user}")
        user_obj = User(**user)
        print(f"got User Object: {user_obj}")

        if not user or not verify_password(password, user.password):
            return None
        return user

    async def create_token_for_user(self, user: User) -> Token:
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user.email},
            expires_delta=access_token_expires
        )
        return Token(access_token=access_token, token_type="bearer")

    async def get_current_user(
        self,
        request: Request
    ) -> User:
        credentials_exception = HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
        token = request.cookies.get('auth_token')
        try:
            token_data: TokenData = verify_access_token(token, credentials_exception)
            if token_data.sub is None:
                raise credentials_exception
        except Exception: # Catch any exception from verify_access_token (e.g., JWT decode error, expiration)
            raise credentials_exception

        user = await self.db["users"].find_one({"normalizedEmail": token_data.sub.upper()})
        if user is None:
            raise credentials_exception # User not found in DB or token subject is invalid
        return user

    async def get_current_user_noexcept(
        self,
        request: Request
    ) -> User|None:
        token = request.cookies.get('auth_token')
        try:
            token_data: TokenData = verify_access_token_noexcept(token)
            if token_data.sub is None:
                return None
        except Exception:
            return None

        user = await self.db["users"].find_one({"normalizedEmail": token_data.sub.upper()})
        return user

# Helper dependency to get an AuthService instance
def get_auth_service(db = Depends(get_db)):
    return AuthService(db)