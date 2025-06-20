from typing import Optional
from pydantic import BaseModel, Field
from agents_back.types.general import ObjectId



class User(BaseModel):
    id: Optional[ObjectId] = Field(default_factory=ObjectId, alias="_id")
    username: str
    email: str
    normalizedEmail: str
    password: str

    model_config = {
        "populate_by_name": True,
        "arbitrary_types_allowed": True,
        "json_encoders": {
            ObjectId: ObjectId
        }
    }
