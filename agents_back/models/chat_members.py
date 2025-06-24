from pydantic import BaseModel, Field
from typing import Optional
from bson import ObjectId
from agents_back.types.chat import ChatMember

class ChatMembers(BaseModel):
    id: Optional[ObjectId] = Field(default_factory=ObjectId)
    chat_id: ObjectId
    members: list[ChatMember]

    model_config = {
        "populate_by_name": True,
        "arbitrary_types_allowed": True,
        "json_encoders": {
            ObjectId: str
        }
    }