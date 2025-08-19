from typing import Optional
from pydantic import BaseModel, Field
from agents_back.types.general import ObjectId


class LoginDTO(BaseModel):
    email: str
    password: str

class RegisterDTO(BaseModel):
    username: str
    email: str
    password: str

class UserDTO(BaseModel):
    id: Optional[ObjectId] = Field(default_factory=ObjectId)
    username: str
    email: str

    model_config = {
        "populate_by_name": True,
        "arbitrary_types_allowed": True,
        "json_encoders": {
            ObjectId: ObjectId
        }
    }
