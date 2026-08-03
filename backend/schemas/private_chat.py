from pydantic import BaseModel
from datetime import datetime


class DirectMessageCreate(BaseModel):
    conversation_id: int
    sender_id: int
    message: str


class DirectMessageResponse(BaseModel):
    id: int
    conversation_id: int
    sender_id: int
    message: str
    created_at: datetime

    class Config:
        from_attributes = True