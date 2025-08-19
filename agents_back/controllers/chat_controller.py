from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, Request, HTTPException
from fastapi.params import Query
from langchain_core.prompts import ChatPromptTemplate
from langchain_groq import ChatGroq
from agents_back.services.auth_service import AuthService, get_auth_service
from agents_back.services.chat_service import ChatService, get_chat_service
from agents_back.types.chat import ChatDTO, Message, DeleteChatDTO, MessageType, ToolCall
from agents_back.types.general import ObjectId
from agents_back.utils.agents import chat_messages_to_agent_message, base_prompt
from agents_back.utils.responses import stream_llm_response
from pydantic import BaseModel

router = APIRouter(prefix="/chat")

@router.post("")
async def chat(chat: ChatDTO, request: Request,
               chat_service: ChatService = Depends(get_chat_service),
               auth_service: AuthService = Depends(get_auth_service)):
    if len(chat.message) == 0:
        raise HTTPException(status_code=400)
    user = await auth_service.get_current_user(request)
    active_chat = await chat_service.create_empty_chat(user.id) if chat.id is None else await chat_service.get_chat(chat.id, user.id)

    new_messages = [
        Message(type=MessageType.MESSAGE, src="user", content=chat.message, timestamp=datetime.now())
    ]
    if active_chat is None:
        active_chat = await chat_service.create_empty_chat(user.id)
        chat.id = None

    messages = [
        ("system", base_prompt),
    ]

    db_messages = await chat_service.get_messages(active_chat.id)

    message_count = len(db_messages.messages if db_messages else 0)
    for i in reversed(range(0, message_count if message_count <= 10 else 10)):
        message = db_messages.messages[i]
        messages.append(chat_messages_to_agent_message(message))

    messages.append(("user", chat.message))

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
    if chat.id is None:
        extra_data = active_chat

    return stream_llm_response(
        tokens,
        None if extra_data is None else extra_data.model_dump_json(by_alias=False),
        tool_calls
    )

@router.get("")
async def get_chats(
        request: Request,
        chat_id: Optional[ObjectId] = Query(None),
        auth_service: AuthService = Depends(get_auth_service),
        chat_service: ChatService = Depends(get_chat_service)
):
    user = await auth_service.get_current_user(request)
    chats = await chat_service.get_chats(user.id) if chat_id is None else await chat_service.get_chat(chat_id, user.id)
    return chats

@router.post("/test")
async def test_tool_response():
    response = "[<tool:agnt:canvas-show svg=\"<svg width='100' height='100'><polygon points='50,0 100,100 0,100' style='fill:#ff0000;stroke:#000000;stroke-width:1' /></svg>\"/>]"
    calls = parse_tool_calls(response)
    return calls

def tool_error(msg: str):
    print(f"[Tool Call Error] {msg}")

def parse_and_build_tool_call(tool_call: str) -> ToolCall:
    if not tool_call.startswith("<") or not tool_call.endswith("/>"):
        tool_error(f"Invalid syntax.\nTool call: {tool_call}")
        raise HTTPException(status_code=400)

    call_obj = ToolCall()

    last_end = 1
    if tool_call.startswith("<tool:"):
        last_end = 6
    next_end = tool_call.find(':', last_end)
    call_obj.namespace = tool_call[last_end:next_end]
    last_end = next_end + 1

    next_end = tool_call.find(' ', last_end)

    call_obj.name = tool_call[last_end:next_end]
    last_end = next_end + 1

    while last_end < len(tool_call):
        next_end = tool_call.find('=', last_end)
        if next_end == -1:
            print(f"[Tool Call] Invalid arg separator. {last_end}.\n{tool_call}")
            break
        arg_name = tool_call[last_end:next_end]
        call_obj.args[arg_name] = None
        last_end = next_end + 1
        if tool_call[last_end] != '"' and tool_call[last_end] != "'":
            print(f"[Tool Call] Invalid delimiter")
            break
        delimiter = tool_call[last_end]
        last_end = last_end + 1
        next_end = tool_call.find(delimiter, last_end)
        call_obj.args[arg_name] = tool_call[last_end:next_end]
        last_end = next_end + 1

        if tool_call[last_end] == '/' and tool_call[last_end + 1] == '>':
            break


    return call_obj

def parse_tool_calls(tool_calls: str) -> list[ToolCall]:
    if not tool_calls.startswith('[') or not tool_calls.endswith(']'):
        tool_error(f"Invalid syntax\nTool Calls: {tool_calls}")
        raise HTTPException(status_code=400)

    tool_calls = tool_calls[1:-1].strip()

    if not tool_calls.startswith('<') or not tool_calls.endswith('>'):
        tool_error(f"Invalid syntax.\nTool Calls: {tool_calls}")
        raise HTTPException(status_code=400)

    calls = []
    first_tag = None
    opened_tags = []

    for idx, char in enumerate(tool_calls):
        if char == '<':
            if tool_calls[idx + 1] != '/':
                opened_tags.append({'start': idx, 'end': None})
                if len(opened_tags) == 1:
                    first_tag = opened_tags[0]
            else:
                opened_tags.pop()
                if len(opened_tags) == 0 and first_tag is not None:
                    for j, c in enumerate(tool_calls, start=idx):
                        if c == '>':
                            first_tag['end'] = j
                            calls.append(first_tag)
                            first_tag = None
                            idx = j
                            break
        if char == '>' and idx > 0 and tool_calls[idx - 1] == '/':
            opened_tags.pop()
            if len(opened_tags) == 0 and first_tag is not None:
                first_tag['end'] = idx+1
                calls.append(first_tag)
                first_tag = None

        if idx != (len(tool_calls) - 1):
            next_char = tool_calls[idx + 1]
            if first_tag is None:
                if next_char != ',' or next_char != ' ':
                    tool_error(f"Invalid separator.\nIdx: {idx}.\nTool Calls: {tool_calls}")
                else:
                    idx = idx + 1

    if len(opened_tags) > 0:
        tool_error(f"Invalid syntax at end.\nTool Calls: {tool_calls}")

    def get_tool_call(obj: dict):
        if obj.get('start') is None or obj.get('end') is None:
            tool_error(f"Invalid tool object.\nTool Calls: {tool_calls}")
            raise HTTPException(status_code=400)
        return tool_calls[obj['start']:obj['end']]

    return list(map(parse_and_build_tool_call, list(map(get_tool_call, calls))))

@router.delete("")
async def delete_chat(
        dto: DeleteChatDTO,
        request: Request,
        auth_service: AuthService = Depends(get_auth_service),
        chat_service: ChatService = Depends(get_chat_service)
):
    user = await auth_service.get_current_user(request)
    return await chat_service.delete_chat(dto.id, user.id)

@router.get("/{chat_id}/messages")
async def get_messages(
        request: Request,
        chat_id: ObjectId,
        auth_service: AuthService = Depends(get_auth_service),
        chat_service: ChatService = Depends(get_chat_service)
):
    user = await auth_service.get_current_user(request)
    chats = await chat_service.get_messages(chat_id)
    return chats
