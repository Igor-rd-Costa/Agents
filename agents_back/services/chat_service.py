import datetime

from fastapi import Depends

from agents_back.db import get_db
from agents_back.models.chat import Chat
from motor import MotorCollection, MotorDatabase

from agents_back.types.general import ObjectId


class ChatService:

    def __init__(self, db: MotorDatabase):
        self.db = db

    async def create_empty_chat(self):
        empty_chat = {
            "user_id": None,
            "name": "Nova Conversa",
            "created_at": datetime.datetime.now(),
            "updated_at": datetime.datetime.now(),
        }
        result = await self.db['chats'].insert_one(empty_chat)
        empty_chat["id"] = result.inserted_id
        return Chat(**empty_chat)

    async def get_chat(self, chat_id: ObjectId) -> Chat|None:
        return await self.db['chats'].find_one({"_id": chat_id})


def get_chat_service(db = Depends(get_db)):
    return ChatService(db)