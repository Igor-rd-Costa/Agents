import asyncio
from datetime import datetime

from fastapi import Depends

from agents_back.db import get_db
from agents_back.models.chat import Chat, ChatMembers
from agents_back.models.chat_messages import ChatMessages
from agents_back.types.chat import ChatMember, Message
from agents_back.types.general import ObjectId
from agents_back.utils.mongodb import mongo_document_to_type


class ChatService:

    def __init__(self, db):
        self.db = db

    async def create_empty_chat(self, user_id: ObjectId):
        chat_id = ObjectId.generate()
        members = await self.create_chat_members(chat_id, user_id)
        empty_chat = {
            "_id": chat_id,
            "user_id": user_id,
            "members_id": members.id,
            "name": "Nova Conversa",
            "created_at": datetime.now(),
            "updated_at": datetime.now(),
        }
        await asyncio.gather(
            self.db["chats"].insert_one(empty_chat),
            self.create_chat_messages(chat_id)
        )
        return mongo_document_to_type(empty_chat, Chat)

    async def get_chat(self, chat_id: ObjectId, user_id: ObjectId) -> Chat|None:
        chat = await self.db["chats"].find_one({"_id": chat_id, "user_id": user_id})
        return chat if chat is None else mongo_document_to_type(chat, Chat)

    async def get_chats(self, user_id: ObjectId):
        chats = await self.db["chats"].find({"user_id": user_id}).to_list()
        return list(map(lambda c: mongo_document_to_type(c, Chat), chats))

    async def delete_chat(self, chat_id: ObjectId, user_id: ObjectId):
        result = await self.db["chats"].delete_one({"_id": chat_id, "user_id": user_id})
        return result.deleted_count > 0

    async def get_messages(self, chat_id: ObjectId):
        messages = await self.db["chat_messages"].find_one({"chat_id": chat_id})
        return messages if messages is None else mongo_document_to_type(messages, ChatMessages)

    async def save_messages(self, chat_id: ObjectId, messages: list[Message]):
        await self.db["chat_messages"].update_one(
            {"chat_id": chat_id},
            {"$push": {
                "messages": {
                    "$each": list(map(lambda m: dict(m), messages))
                }
            }}
        )

    async def create_chat_members(self, chat_id: ObjectId, user_id: ObjectId):
        members = {
            "chat_id": chat_id,
            "members": [ChatMember(id=user_id).model_dump()]
        }
        result = await self.db["chat_members"].insert_one(members)
        members["_id"] = result.inserted_id
        return mongo_document_to_type(members, ChatMembers)

    async def create_chat_messages(self, chat_id: ObjectId):
        chat_messages = {
            "chat_id": chat_id,
            "messages": []
        }
        result = await self.db["chat_messages"].insert_one(chat_messages)
        chat_messages["_id"] = result.inserted_id
        return mongo_document_to_type(chat_messages, ChatMessages)


def get_chat_service(db = Depends(get_db)):
    return ChatService(db)