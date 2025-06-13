from motor.motor_asyncio import AsyncIOMotorClient
import os

dbUrl = os.environ.get("MONGO_URI")
client = AsyncIOMotorClient(dbUrl)

def get_db():
        yield client["AgentsDB"]