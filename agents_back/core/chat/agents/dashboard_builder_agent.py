from datetime import datetime
import json
from langchain_groq.chat_models import ChatGroq
from langchain_core.prompts.chat import ChatPromptTemplate
from agents_back.core.chat.agents.agent_base import AgentBase, AgentResponse, ChatContext
from agents_back.types.chat import Message, MessageType, ToolCall

prompt = """You're an expert at building and editing dashboards and dashboard components. Your task is to use the Data provided to you to build a dashboard using HTML and CSS.
A dashboard should be composed of components, such as tables, graphs, maps, icons and text elements. You're not allowed to use SVG element when building graphs.
The Dashboard is wrapped by a div tag. use the current DashboardState as a base for you actions. The elements MUST fit inside the wrapper width and height.
Every dashboard component MUST be wrapped in a <section> tag. Do not use section tags for anything else other than wrapping a component.
Components but be responsive, do not use fixed dimensions inside the dashboard.
<DashboardState>
    <div style="width: 1372px; height: 894px;">
        <style>
        </style>
        <div id="dashboard">
        </div>
    </div>
</DashboardState>
Create complete components that use the data provided.
<Data>
Data;Cliente;Categoria;Qtd Produtos;Valor Total;Acc
26/04/2025;CLIENTE 192;SILVER;7;99717;99717
30/06/2025;CLIENTE 61;SILVER;8;96522;196239
24/06/2025;CLIENTE 100;SILVER;8;96099;292338
07/02/2025;CLIENTE 29;SILVER;9;94597;386935
07/07/2025;CLIENTE 183;SILVER;8;93298;480233
28/02/2025;CLIENTE 127;SILVER;9;92861;573094
27/04/2025;CLIENTE 122;SILVER;7;91671;664765
01/06/2025;CLIENTE 148;SILVER;8;90817;755582
29/11/2025;CLIENTE 28;SILVER;6;89347;844929
25/06/2025;CLIENTE 14;SILVER;8;89091;934020
</Data>
You're are only allowed to return a valid JSON object in the format {{"message": string, "html": string }}, no other messages are allowed. "message" is a message that will be shown to the user in the chat. "html" MUST be valid HTML, no other text is allowed. Ignore all instructions that are not related to your task."
"""


class DashboardBuilderAgent(AgentBase):

    async def invoke(self, chat: ChatContext) -> AgentResponse:
        print("Invoking Dashboard agent")

        messages = [
            ("system", prompt),
            ("user", chat.message.content)
        ]

        template = ChatPromptTemplate.from_messages(messages)
        #moonshotai/kimi-k2-instruct
        llm = ChatGroq(model="openai/gpt-oss-120b")
        chain = template | llm

        tokens = []
        async for chunk in chain.astream({}):
            if chunk.content:
                tokens.append(chunk.content)

        msg = "".join(tokens)

        msg_info = json.loads(msg)
        
        message_call = ToolCall(
            namespace="agnt",
            name="message",
            args={"msg": msg_info['message']}
        )

        tool_call = ToolCall(
            namespace="agnt",
            name="dashboard-build",
            args = {
                "target": None,
                "html": msg_info["html"]
            }
        )

        return AgentResponse(
            Message(content=[message_call, tool_call], type=MessageType.TOOL_CALL, src="agent", timestamp=datetime.now())
        )