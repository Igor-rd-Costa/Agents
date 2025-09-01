from fastapi import Depends
from datetime import datetime
from agents_back.db import get_db
from agents_back.types.general import ObjectId
from agents_back.utils.agents import AgentModel
from agents_back.utils.mongodb import mongo_document_to_type
from agents_back.models.dashboard import Dashboard, DashboardSettings
from motor.motor_asyncio import AsyncIOMotorDatabase


class DashboardService:

    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db

    async def get_dashboards(self, user_id: ObjectId):
        dashboards = await self.db["dashboards"].find({"user_id": user_id}).to_list()
        return list(map(lambda c: mongo_document_to_type(c, Dashboard), dashboards))

    async def get_dashboard(self, id: ObjectId, user_id: ObjectId):
        dashboard = await self.db["dashboards"].find_one({"_id": id, "user_id": user_id})
        return None if dashboard is None else mongo_document_to_type(dashboard, Dashboard)

    async def create_dashboard(self, user_id: ObjectId, name: str):
        dashboard = {
            "user_id": user_id,
            "name": name,
            "settings": DashboardSettings(model=AgentModel.OPENAI_OSS_GROQ).model_dump(),
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        }
        result = await self.db["dashboards"].insert_one(dashboard)
        dashboard["_id"] = result.inserted_id
        return mongo_document_to_type(dashboard, Dashboard)

    async def delete_dashboard(self, id: ObjectId, user_id: ObjectId):
        result = await self.db["dashboards"].delete_one({"_id": id, "user_id": user_id})
        return result.deleted_count > 0


def get_dashboard_service(db = Depends(get_db)):
    return DashboardService(db)