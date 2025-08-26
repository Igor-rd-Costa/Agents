from asyncio import Queue
import json
from enum import IntEnum, StrEnum
from pydantic import BaseModel, ConfigDict, Field
from typing import Optional

from agents_back.services.auth_service import AuthService
from agents_back.services.chat_service import ChatService


class SSEEventType(IntEnum):
    REQUEST = 0
    RESPONSE = 1
    NOTIFICATION = 2

class SSEEvent(StrEnum):
    CONNECTED = "connect"
    DISCONNECTED = "disconnect"
    PING = "ping"
    MESSAGE = "message"

class SSERequestDataBase(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    connection_id: str = Field(alias="connectionId")

class SSEPingRequestData(SSERequestDataBase):
    pass

class SSEMessageRequestData(SSERequestDataBase):
    data: str
    chat_id: str|None = Field(alias="chatId", default=None)

class SSEMessage(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    id: str
    event: SSEEvent
    event_type: SSEEventType = Field(alias="eventType")
    data: Optional[str] = None

    def to_message_string(self):
        lines = [
            f"id: {self.id}",
            f"event: {self.event}",
            f"type: {self.event_type}"
        ]
        if self.data:
            for line in self.data.split('\n'):
                lines.append(f"data: {line}")

        return "\n".join(lines) + "\n\n"

    def get_data(self):
        if self.data is None:
            return None

        obj = json.loads(self.data)

        if self.event == SSEEvent.PING:
            return SSEPingRequestData(**obj)
        if self.event == SSEEvent.MESSAGE:
            return SSEMessageRequestData(**obj)

        return obj

class ConnectionState:
    queue: Queue
    hanging_pings: list[str]
    auth_service: AuthService
    chat_service: ChatService

    def __init__(self, queue: Queue, auth_service: AuthService, chat_service: ChatService):
        self.queue = queue
        self.hanging_pings = []
        self.auth_service = auth_service
        self.chat_service = chat_service