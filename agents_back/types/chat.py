from pydantic import BaseModel

from agents_back.types.general import ObjectId

class Message(BaseModel):
    source: str
    content: str

class ChatDTO(BaseModel):
    id: ObjectId|None
    message: str