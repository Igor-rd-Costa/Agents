from datetime import datetime
from agents_back.services.dashboard_service import Dashboard
from pydantic import BaseModel
from agents_back.types.chat import Message, MessageType

class ChatContext(BaseModel):
    dashboard: Dashboard
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
