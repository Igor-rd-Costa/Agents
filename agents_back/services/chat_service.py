from datetime import datetime

from fastapi import Depends

from agents_back.db import get_db
from agents_back.models.chat import Chat, ChatMembers
from agents_back.types.chat import ChatMember

from agents_back.types.general import ObjectId


class ChatService:

    def __init__(self, db):
        self.db = db

    async def create_empty_chat(self, user_id):
        chat_id = ObjectId.generate()
        members = await self.create_chat_members(chat_id, user_id)
        empty_chat = {
            "chat_id": chat_id,
            "user_id": user_id,
            "members_id": members.id,
            "name": "Nova Conversa",
            "created_at": datetime.now(),
            "updated_at": datetime.now(),
        }
        result = await self.db["chats"].insert_one(empty_chat)
        empty_chat["id"] = result.inserted_id
        return Chat(**empty_chat)

    async def get_chat(self, chat_id: ObjectId) -> Chat|None:
        chat = await self.db["chats"].find_one({"_id": chat_id})
        return chat if chat is None else Chat(**chat)

    async def create_chat_members(self, chat_id: ObjectId, user_id: ObjectId):
        members = {
            "chat_id": chat_id,
            "members": [ChatMember(id=user_id).model_dump()]
        }
        result = await self.db["chat_members"].insert_one(members)
        members["_id"] = result.inserted_id
        return ChatMembers(**members)


def get_chat_service(db = Depends(get_db)):
    return ChatService(db)