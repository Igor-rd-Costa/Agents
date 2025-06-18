from motor.motor_asyncio import AsyncIOMotorClient
import os

db_url = os.environ.get("MONGO_URI")
client = AsyncIOMotorClient(db_url)

class AgentsCollection:
        pass

class AgentsDB:
        dbUrl = os.environ.get("MONGO_URI")
        client = AsyncIOMotorClient(db_url)

        def get_collection(self, collection: str):
                col = self.client[collection]
                print(f"Col: {type(col)}")
                return AgentsCollection()


def get_db():
        yield client["AgentsDB"]