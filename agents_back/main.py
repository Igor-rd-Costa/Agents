from dotenv import load_dotenv
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
    allow_origins=["http://localhost:3000", "http://192.168.1.85:3000", "http://localhost:3001", "http://192.168.1.85:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from controllers import __path__ as controller_path

for _, module_name, _ in pkgutil.iter_modules(controller_path):
    module = importlib.import_module(f"controllers.{module_name}")
    router = getattr(module, "router", None)
    if router:
        app.include_router(router)