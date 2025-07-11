from agents_back.types.chat import Message

def chat_messages_to_agent_message(message: Message):
    src = "user" if message.type == "user" else "ai"
    return src, message.content