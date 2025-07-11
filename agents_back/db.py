from motor.motor_asyncio import AsyncIOMotorClient
import os

db_url = os.environ.get("MONGO_URI")
client = AsyncIOMotorClient(db_url)

class AgentsCollection:
        pass

def get_db():
        yield client["AgentsDB"]