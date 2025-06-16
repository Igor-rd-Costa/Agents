from pydantic import BaseModel, Field
from typing import Optional
from agents_back.types.general import ObjectId
import datetime

class Chat(BaseModel):
    id: Optional[ObjectId] = Field(default_factory=ObjectId)
    user_id: Optional[ObjectId] = Field(default_factory=ObjectId)
    name: str
    created_at: datetime.datetime
    updated_at: datetime.datetime

    model_config = {
        "populate_by_name": True,
        "arbitrary_types_allowed": True,
        "json_encoders": {
            ObjectId: str
        }
    }
