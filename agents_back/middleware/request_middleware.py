from contextvars import ContextVar
from fastapi import FastAPI, Request
from starlette.middleware.base import BaseHTTPMiddleware

request_context: ContextVar[Request] = ContextVar('request')

class RequestMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        request_context.set(request)
        response = await call_next(request)
        return response

def get_current_request() -> Request:
    return request_context.get()