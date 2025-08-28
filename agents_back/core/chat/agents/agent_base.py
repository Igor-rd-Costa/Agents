from curses import raw
from datetime import datetime
from pydantic import BaseModel
from agents_back.models.chat import Chat
from agents_back.types.chat import Message, MessageType

class ChatContext(BaseModel):
    chat: Chat
    message: Message

class AgentResponse:
    message: Message

    def __init__(self, message: Message) -> None:
        self.message = message

class AgentBase:

    async def invoke(self, chat: ChatContext) -> AgentResponse:
        return AgentResponse(
            Message(content="An error has occured.", type=MessageType.MESSAGE, src="agent", timestamp=datetime.now())
        )
