from datetime import datetime
from langchain_groq.chat_models import ChatGroq
from langchain_core.prompts.chat import ChatPromptTemplate
from agents_back.types.chat import Message, MessageType
from agents_back.utils.tools import parse_tool_calls
from agents_back.utils.utils import services_context
from agents_back.utils.agents import chat_messages_to_agent_message, get_agent_model, AgentModel
from agents_back.core.chat.agents.agent_base import AgentBase, AgentResponse, ChatContext

base_prompt = """You're an expert in generating JSON. Your job is to generate valid JSON based on the TypeScript types provided bellow.
Use the types that best fits the user needs. The JSON will be used to create visual elements to the user. Use the context provided
about the data structure with the types provided to create the JSON.

=======Context=======
{{
    "id": 64,
    "name": "Vendas Vendedores",
    "caption": "Vendas Vendedores",
    "description": "Bigtable com informações de vendas dos vendedores",
    "datasourceName": "ABigTable",
    "url": "http://192.168.1.85:8080/load.iface?content=/bigtable/BigTables/64.bigtable",
    "fields": [
        {{
            "key": "Cliente",
            "title": "Cliente",
            "type": "Regular",
            "format": "Text"
        }},
        {{
            "key": "Categoria",
            "title": "Categoria",
            "type": "Regular",
            "format": "Text"
        }},
        {{
            "key": "QtdProdutos",
            "title": "Qtd Produtos",
            "type": "Measure",
            "format": "Decimal"
        }},
        {{
            "key": "ValorTotal",
            "title": "Valor Total",
            "type": "Measure",
            "format": "Currency"
        }},
        {{
            "key": "Data",
            "title": "Data",
            "type": "TimeDimension",
            "format": "Date"
        }},
        {{
            "key": "acumulado",
            "title": "Acumulado",
            "type": "Calculated Measure",
            "format": "Currency",
            "calculationType": "ACCUMULATED",
            "calculationTarget": "ValorTotal"
        }}
    ]
}}
=====================

========Types========
type ChartType = 'vertical bars' | 'horizontal bars'

type FieldKey = string;

type Chart = {{
    name: string,
    description: string,
    type: ChartType
    mainColor: string,
    backgroundColor: string,
    columns: FieldKey[],
    rows: FieldKey[]
}}
=================

You MUST return valid JSON that conforms to the types listed above, no other messages are allowed.
"""

class DSLAgent(AgentBase):

    async def invoke(self, chat: ChatContext) -> AgentResponse:
        print("Invoking DSL Agent")

        messages = [
            ("system", base_prompt),
            ("user", chat.message.content)
        ]

        template = ChatPromptTemplate.from_messages(messages)
        llm = get_agent_model(AgentModel.OPENAI_OSS_GROQ)
        if llm is None:
            print(f"[Chat] Invalid LLM.")
            llm = ChatGroq(model="openai/gpt-oss-120b")
        chain = template | llm

        tokens = []
        async for chunk in chain.astream({}):
            if chunk.content:
                tokens.append(chunk.content)

        msg = "".join(tokens)

        return AgentResponse(
            Message(type=MessageType.MESSAGE, src="agent", content=msg, timestamp=datetime.now())
        )