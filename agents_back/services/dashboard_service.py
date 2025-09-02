from agents_back.types.chat import ChatMembers
from agents_back.models.chat_messages import ChatMessages
from agents_back.types.chat import ChatMember, Message
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


    async def create_empty_dashboard(self, user_id: ObjectId):
        dashboard = {
            "user_id": user_id,
            "name": "New Dashboard",
            "settings": DashboardSettings(model=AgentModel.OPENAI_OSS_GROQ).model_dump(),
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        }
        result = await self.db["dashboards"].insert_one(dashboard)
        await self.create_chat_messages(result.inserted_id, user_id)
        dashboard["_id"] = result.inserted_id
        return mongo_document_to_type(dashboard, Dashboard)


    async def delete_dashboard(self, id: ObjectId, user_id: ObjectId):
        result = await self.db["dashboards"].delete_one({"_id": id, "user_id": user_id})
        return result.deleted_count > 0


    async def get_messages(self, dashboard_id: ObjectId):
        messages = await self.db["chat_messages"].find_one({"dashboard_id": dashboard_id})
        return None if messages is None else mongo_document_to_type(messages, ChatMessages)


    async def save_messages(self, dashboard_id: ObjectId, messages: list[Message]):
        await self.db["chat_messages"].update_one(
            {"dashboard_id": dashboard_id},
            {"$push": {
                "messages": {
                    "$each": list(map(lambda m: m.model_dump(), messages))
                }
            }}
        )

    async def create_chat_messages(self, dashboard_id: ObjectId, user_id: ObjectId):
        chat_messages = {
            "dashboard_id": dashboard_id,
            "members": ChatMembers(dashboard_id=dashboard_id, members=[ChatMember(id=user_id).model_dump()]).model_dump(),
            "messages": []
        }
        result = await self.db["chat_messages"].insert_one(chat_messages)
        chat_messages["_id"] = result.inserted_id
        return mongo_document_to_type(chat_messages, ChatMessages)


def get_dashboard_service(db = Depends(get_db)):
    return DashboardService(db)