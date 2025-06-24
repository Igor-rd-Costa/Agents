from typing import Optional

from pydantic import BaseModel, Field
from agents_back.types.chat import Message
from agents_back.types.general import ObjectId


class ChatMessages(BaseModel):
    id: Optional[ObjectId] = Field(default_factory=ObjectId)
    chat_id: ObjectId
    messages: list[Message]

    model_config = {
        "populate_by_name": True,
        "arbitrary_types_allowed": True,
        "json_encoders": {
            ObjectId: str
        }
    }