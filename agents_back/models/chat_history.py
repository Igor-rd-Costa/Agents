from pydantic import BaseModel, Field
from typing import Optional
from bson import ObjectId

class ChatHistory(BaseModel):
    id: Optional[ObjectId] = Field(default_factory=ObjectId, alias="_id")
    chat_id: ObjectId
