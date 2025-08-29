from pydantic import BaseModel, Field
from typing import Optional

from agents_back.models.chat_members import ChatMembers
from agents_back.types.general import ObjectId
from datetime import datetime

class Chat(BaseModel):
    id: Optional[ObjectId] = Field(default_factory=ObjectId)
    user_id: ObjectId = Field(alias="userId")
    members_id: Optional[ObjectId] = Field(alias='membersId')
    name: str
    created_at: datetime = Field(alias='createdAt')
    updated_at: datetime = Field(alias='updatedAt')

    model_config = {
        "populate_by_name": True,
        "arbitrary_types_allowed": True,
        "json_encoders": {
            ObjectId: str
        },
        "by_alias": False
    }