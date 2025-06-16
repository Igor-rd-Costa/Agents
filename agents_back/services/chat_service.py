import datetime

from fastapi import Depends

from agents_back.db import get_db
from agents_back.models.chat import Chat
from motor import MotorCollection, MotorDatabase

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

def get_chat_service(db = Depends(get_db)):
    return ChatService(db)