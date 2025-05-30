from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import importlib
import pkgutil
from dotenv import load_dotenv

load_dotenv()
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://172.29.240.1:3000"],
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