from pydantic import BaseModel, Field
from typing import Optional

from agents_back.types.chat import Message
from agents_back.types.general import ObjectId
from datetime import datetime

class Chat(BaseModel):
    id: Optional[ObjectId] = Field(default_factory=ObjectId, alias="_id")
    user_id: Optional[ObjectId] = Field(default_factory=ObjectId)
    name: str
    created_at: datetime
    updated_at: datetime
    messages: list[Message]

    model_config = {
        "populate_by_name": True,
        "arbitrary_types_allowed": True,
        "json_encoders": {
            ObjectId: str
        }
    }

    @staticmethod
    def empty(user: ObjectId|None):
        return Chat(
            user_id=user,
            name="Nova Conversa",
            created_at=datetime.now(),
            updated_at=datetime.now(),
            messages=[]
        )
