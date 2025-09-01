from pydantic import BaseModel

from agents_back.types.general import ObjectId


class DeleteDashboardDTO(BaseModel):
    id: ObjectId


class CreateDashboardDTO(BaseModel):
    name: str