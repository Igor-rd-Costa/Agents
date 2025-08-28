from dotenv import load_dotenv

from agents_back.middleware.request_middleware import RequestMiddleware

load_dotenv()

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import importlib
import pkgutil

from agents_back.services.mcp_service import MCPService


@asynccontextmanager
async def lifespan(app: FastAPI):
    await MCPService.init()
    yield
    await MCPService.shutdown()

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://192.168.1.85:3000", "http://127.0.0.1:3000", "http://localhost:3001", "http://192.168.1.85:3001", "http://127.0.0.1:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(RequestMiddleware)

from fastapi import HTTPException
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from fastapi import Request

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    print(f"Validation error on {request.method} {request.url}")
    print(f"Headers: {dict(request.headers)}")
    print(f"Error details: {exc.errors()}")
    return JSONResponse(
        status_code=422,
        content={"detail": exc.errors(), "body": exc.body}
    )

from agents_back.controllers import __path__ as controller_path

for _, module_name, _ in pkgutil.iter_modules(controller_path):
    module = importlib.import_module(f"agents_back.controllers.{module_name}")
    router = getattr(module, "router", None)
    if router:
        app.include_router(router)