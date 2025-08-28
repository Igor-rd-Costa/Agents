from fastapi import Request, HTTPException

from agents_back.core.chat.chat_system import do_chat_task, active_connections
from agents_back.services.auth_service import AuthService
from agents_back.services.chat_service import ChatService
from agents_back.types.sse import SSEMessage, SSEEvent, SSEEventType, ConnectionState, SSEPingRequestData, \
    SSERequestDataBase
from uuid import uuid4
import asyncio

async def start_connection(connection_id: str, auth_service: AuthService, chat_service: ChatService):

    queue = asyncio.Queue(0)
    active_connections[connection_id] = ConnectionState(queue)

    print(f"[Chat] {connection_id} connected")
    try:
        success_message = SSEMessage(
            id='0',
            event=SSEEvent.CONNECTED,
            event_type=SSEEventType.RESPONSE,
            data=connection_id,
        )

        yield success_message.to_message_string()

        while True:
            try:
                message: SSEMessage = await asyncio.wait_for(queue.get(), timeout=60.0)
                print(f"[Chat] {connection_id}: got message '{message}'")

                match message.event:
                    case SSEEvent.PING:
                        process_ping_request(message)
                    case SSEEvent.MESSAGE:
                        yield (await process_message_request(message)).to_message_string()
                    case _:
                        print(f"[Chat] {connection_id}: unhandled event '{message.event}'")

            except asyncio.TimeoutError:
                connection_state = active_connections[connection_id]

                if len(connection_state.hanging_pings) > 2:
                    print(f"[Chat] {connection_id} pings not answered")
                    break

                ping_id = str(uuid4())
                ping_message = SSEMessage(
                    id=ping_id,
                    event=SSEEvent.PING,
                    event_type=SSEEventType.REQUEST
                )
                connection_state.hanging_pings.append(ping_id)
                print(f"[Chat] {connection_id} Sending ping message")
                yield ping_message.to_message_string()
    except asyncio.CancelledError:
        pass
    finally:
        print(f"[Chat] {connection_id} disconnected")
        if connection_id in active_connections:
            del active_connections[connection_id]

async def build_connection_id(message: SSEMessage, auth_service: AuthService, request: Request):
    chat_id = None if len(message.id) == 0 else message.id
    user = await auth_service.get_current_user(request)
    connection_id = str(user.id) + ('' if chat_id is None else '#' + chat_id) + '#' + str(uuid4())
    return connection_id

async def send_to_connection(connection_id: str, message: SSEMessage):
    if connection_id in active_connections:
        try:
            connection_queue = active_connections[connection_id].queue
            await connection_queue.put(message)
            return True
        except Exception:
            active_connections.pop(connection_id, None)
            return False
    return False

def process_ping_request(message: SSEMessage):
    if message.event is not SSEEvent.PING or message.event_type is not SSEEventType.RESPONSE:
        raise HTTPException(status_code=400)

    data: SSEPingRequestData = message.get_data()
    connection_state = active_connections[data.connection_id]

    if message.id in connection_state.hanging_pings:
        connection_state.hanging_pings.remove(message.id)
        print(f"[Chat] {data.connection_id} ping request answered")
        return

    if message.id not in connection_state.hanging_pings and len(connection_state.hanging_pings) > 0:
        raise HTTPException(status_code=404)

async def process_message_request(message: SSEMessage):
    if message.event is not SSEEvent.MESSAGE or message.event_type is not SSEEventType.REQUEST:
        raise HTTPException(status_code=400)

    return await do_chat_task(message)


async def process_message(message: SSEMessage, auth_service: AuthService, request: Request):
    if message.event == SSEEvent.CONNECTED:
        return False

    data: SSERequestDataBase = message.get_data()

    await auth_service.validate_connection_ownership(data.connection_id, request)
    if data.connection_id not in active_connections:
        raise HTTPException(status_code=404)

    connection_state = active_connections[data.connection_id]
    connection_state.queue.put_nowait(message)
    return True