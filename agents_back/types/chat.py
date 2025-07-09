from pydantic import BaseModel
from datetime import datetime
from agents_back.types.general import ObjectId

class ChatMember(BaseModel):
    id: ObjectId

class Message(BaseModel):
    type: str
    content: str
    timestamp: datetime

class ChatDTO(BaseModel):
    id: ObjectId|None
    message: str

class DeleteChatDTO(BaseModel):
    id: ObjectId