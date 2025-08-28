from contextvars import ContextVar
from agents_back.middleware.request_middleware import request_context
from agents_back.services import auth_service
from agents_back.services.auth_service import AuthService
from agents_back.services.chat_service import ChatService
from pydantic import BaseModel, ConfigDict
from fastapi import Request

class Services(BaseModel):
    model_config = ConfigDict(arbitrary_types_allowed=True)
    auth_service: AuthService
    chat_service: ChatService
    request: Request

services_context: ContextVar[Services] = ContextVar('services')