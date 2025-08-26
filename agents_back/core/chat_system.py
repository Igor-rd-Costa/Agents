from http.client import HTTPException
from langchain_groq.chat_models import ChatGroq
from langchain_core.prompts.chat import ChatPromptTemplate
from agents_back.middleware.request_middleware import get_current_request, request_context
from agents_back.services.auth_service import AuthService
from agents_back.services.chat_service import ChatService
from agents_back.types.chat import MessageType, Message, ToolCall
from agents_back.models.chat import Chat
from agents_back.types.general import ObjectId
from agents_back.types.sse import SSEMessage, SSEMessageRequestData, SSEEvent, SSEEventType, ConnectionState
from agents_back.utils.agents import base_prompt, chat_messages_to_agent_message
from fastapi import HTTPException, Depends, Request
from pydantic import BaseModel, Field
from datetime import datetime

from agents_back.utils.tools import parse_tool_calls

active_connections: dict[str, ConnectionState] = {}

class ChatResponse(BaseModel):
    data: str|list[ToolCall]
    message_type: MessageType = Field(alias="messageType")
    chat: Chat|None

def get_chat_id_from_connection_id(connection_id: str):
    parts = connection_id.split('#')
    if len(parts) != 3:
        return None
    chat_id = parts[1]
    if ObjectId.is_valid(chat_id):
        return ObjectId(chat_id)
    return None

async def do_chat_task(message: SSEMessage):
    data: SSEMessageRequestData = message.get_data()
    connection_state = active_connections[data.connection_id]
    auth_service = connection_state.auth_service
    chat_service = connection_state.chat_service
    request = request_context.get()
    user = await auth_service.get_current_user(request)
    msg = data.data
    chat_id = get_chat_id_from_connection_id(data.connection_id)

    if len(msg) == 0:
        raise HTTPException(status_code=400)
    active_chat = await chat_service.create_empty_chat(user.id) if chat_id is None else await chat_service.get_chat(chat_id, user.id)
#
    new_messages = [
        Message(type=MessageType.MESSAGE, src="user", content=msg, timestamp=datetime.now())
    ]
    if active_chat is None:
        active_chat = await chat_service.create_empty_chat(user.id)
        chat_id = None

    messages = [
        ("system", base_prompt),
    ]

    db_messages = await chat_service.get_messages(active_chat.id)

    message_count = len(db_messages.messages if db_messages else 0)
    for i in reversed(range(0, message_count if message_count <= 10 else 10)):
        message = db_messages.messages[i]
        messages.append(chat_messages_to_agent_message(message))

    messages.append(("user", msg))

    template = ChatPromptTemplate.from_messages(messages)
    llm = ChatGroq(model="llama-3.3-70b-versatile")
    chain = template | llm

    tokens = []
    async for chunk in chain.astream({}):
        if chunk.content:
            tokens.append(chunk.content)

    msg = "".join(tokens)
    tool_calls = []
    message_type = MessageType.MESSAGE
    if msg.startswith("[") and msg.endswith("]"):
        tool_calls = parse_tool_calls(msg)
        msg = tool_calls
        message_type = MessageType.TOOL_CALL
        tokens = []

    new_messages.append(Message(type=message_type, src="agent", content=msg, timestamp=datetime.now()))
    await chat_service.save_messages(active_chat.id, new_messages)

    extra_data = None
    if chat_id is None:
        extra_data = active_chat

    return SSEMessage(
        id=message.id,
        event=SSEEvent.MESSAGE,
        eventType=SSEEventType.RESPONSE,
        data= ChatResponse(data=msg, messageType=message_type, chat=extra_data).model_dump_json(),
    )