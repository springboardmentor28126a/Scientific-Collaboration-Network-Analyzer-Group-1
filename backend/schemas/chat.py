from datetime import datetime
from pydantic import BaseModel


class ChatCreate(BaseModel):
    group_id: int
    sender_id: int
    message: str


class ChatResponse(BaseModel):
    id: int
    group_id: int
    sender_id: int
    message: str
    created_at: datetime

    class Config:
        from_attributes = True