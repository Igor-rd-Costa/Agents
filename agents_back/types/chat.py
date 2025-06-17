from typing import Optional

from agents_back.types.general import ObjectId


class ChatDTO:
    id: Optional[ObjectId]
    message: str