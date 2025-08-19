from enum import IntEnum

from pydantic import BaseModel
from datetime import datetime

from agents_back.types.general import ObjectId

class ChatMember(BaseModel):
    id: ObjectId

class MessageType(IntEnum):
    MESSAGE = 0
    TOOL_CALL = 1

class ToolCall(BaseModel):
    name: str | None = None
    namespace: str | None = None
    args: dict = {}

    def is_valid(self):
        return self.name is not None and self.namespace is not None

class Message(BaseModel):
    type: MessageType
    src: str
    content: str|list[ToolCall]
    timestamp: datetime

class ChatDTO(BaseModel):
    id: ObjectId|None
    message: str

class DeleteChatDTO(BaseModel):
    id: ObjectId