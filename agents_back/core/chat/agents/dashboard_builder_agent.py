from datetime import datetime
from agents_back.core.chat.agents.agent_base import AgentBase, AgentResponse, ChatContext
from agents_back.types.chat import Message, MessageType


class DashboardBuilderAgent(AgentBase):

    async def invoke(self, chat: ChatContext) -> AgentResponse:
        print("Invoking Dashboard agent")

        return AgentResponse(
            Message(content="Hello, I'm the DashboardBuilder Agent and I have not been implemented yet", type=MessageType.MESSAGE, src="agent", timestamp=datetime.now())
        )