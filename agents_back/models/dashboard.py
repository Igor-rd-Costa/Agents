from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime
from agents_back.types.general import ObjectId
from agents_back.utils.agents import AgentModel


class DashboardSettings(BaseModel):
    model: AgentModel

class Dashboard(BaseModel):
    model_config = ConfigDict(populate_by_name=True, arbitrary_types_allowed=True, json_encoders={ObjectId: str})
    id: Optional[ObjectId] = Field(default_factory=ObjectId)
    user_id: ObjectId = Field(alias="userId")
    name: str
    settings: DashboardSettings
    created_at: datetime = Field(alias='createdAt')
    updated_at: datetime = Field(alias='updatedAt')