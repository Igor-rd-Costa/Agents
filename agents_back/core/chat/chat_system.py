from ast import alias
from http.client import HTTPException
from agents_back.core.chat.agents.router_agent import RouterAgent
from fastapi import HTTPException
from pydantic import BaseModel, Field,ConfigDict
from datetime import datetime
from agents_back.utils.utils import services_context
from agents_back.types.chat import MessageType, Message, ToolCall
from agents_back.models.chat import Chat
from bson import ObjectId
from agents_back.types.sse import SSEMessage, SSEMessageRequestData, SSEEvent, SSEEventType, ConnectionState
from agents_back.core.chat.agents.agent_base import AgentBase, ChatContext


active_connections: dict[str, ConnectionState] = {}

class ChatData(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    chat: Chat|None
    connection_id: str|None = Field(alias="connectionId")

class ChatResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    data: str|list[ToolCall]
    message_type: MessageType = Field(alias="messageType")
    chat: ChatData|None

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
    services = services_context.get()
    auth_service = services.auth_service
    chat_service = services.chat_service
    request = services.request
    user = await auth_service.get_current_user(request)
    msg = data.data
    chat_id = get_chat_id_from_connection_id(data.connection_id)
    print("Got Data: ", data)
    print("Got ChatId: ", chat_id)

    if len(msg) == 0:
        raise HTTPException(status_code=400)
    active_chat = await chat_service.create_empty_chat(user.id) if chat_id is None else await chat_service.get_chat(chat_id, user.id)
#
    user_msg = Message(type=MessageType.MESSAGE, src="user", content=msg, timestamp=datetime.now())
    if active_chat is None:
        active_chat = await chat_service.create_empty_chat(user.id)
        chat_id = None

    chat_context = ChatContext(message=user_msg, chat=active_chat)

    route_response = await RouterAgent().invoke(chat_context)

    agent: AgentBase = route_response.message.content
    print(f"Selected agent: {agent}")
    agent_response = await agent.invoke(chat_context)

    new_messages = [
        user_msg,
        agent_response.message
    ]

    await chat_service.save_messages(active_chat.id, new_messages)

    extra_data = None
    if chat_id is None:
        extra_data = ChatData(chat=active_chat, connection_id=update_connection(data.connection_id, active_chat.id))

    return SSEMessage(
        id=message.id,
        event=SSEEvent.MESSAGE,
        eventType=SSEEventType.RESPONSE,
        data= ChatResponse(data=agent_response.message.content, message_type=agent_response.message.type, chat=extra_data).model_dump_json(by_alias=True),
    )

def update_connection(connection_id: str, chat_id: str):
    if get_chat_id_from_connection_id(connection_id) is not None:
        return None

    parts = connection_id.split('#')

    if len(parts) != 2 or not ObjectId.is_valid(chat_id):
        return None

    new_connection_id = f"{parts[0]}#{chat_id}#{parts[1]}"
    current_connection = active_connections.get(connection_id)

    if current_connection is None:
        return None

    active_connections[new_connection_id] = current_connection
    del active_connections[connection_id]
    return new_connection_id