from enum import IntEnum
from pydantic import BaseModel, Field
from datetime import datetime

from agents_back.types.general import ObjectId


class ChatMember(BaseModel):
    id: ObjectId


class MessageType(IntEnum):
    MESSAGE = 0
    TOOL_CALL = 1
    AGENT_CALL = 2


class ToolCall(BaseModel):
    name: str | None = None
    namespace: str | None = None
    args: dict = {}

    def is_valid(self):
        return self.name is not None and self.namespace is not None


class Message(BaseModel):
    type: MessageType
    src: str
    content: str|list[ToolCall]|object
    timestamp: datetime


class ChatMembers(BaseModel):
    id: ObjectId = Field(default_factory=ObjectId)
    dashboard_id: ObjectId
    members: list[ChatMember]

    model_config = {
        "populate_by_name": True,
        "arbitrary_types_allowed": True,
        "json_encoders": {
            ObjectId: str
        }
    }