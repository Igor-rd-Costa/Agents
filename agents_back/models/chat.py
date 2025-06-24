from pydantic import BaseModel, Field
from typing import Optional

from agents_back.models.chat_members import ChatMembers
from agents_back.types.general import ObjectId
from datetime import datetime

class Chat(BaseModel):
    id: Optional[ObjectId] = Field(default_factory=ObjectId)
    user_id: ObjectId
    members_id: Optional[ObjectId]
    name: str
    created_at: datetime
    updated_at: datetime

    model_config = {
        "populate_by_name": True,
        "arbitrary_types_allowed": True,
        "json_encoders": {
            ObjectId: str
        },
        "by_alias": False
    }