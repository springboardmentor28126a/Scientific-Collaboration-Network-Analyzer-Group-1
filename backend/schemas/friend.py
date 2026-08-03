from pydantic import BaseModel
from datetime import datetime


class FriendRequestCreate(BaseModel):
    sender_id: int
    receiver_id: int


class FriendRequestResponse(BaseModel):
    id: int
    sender_id: int
    receiver_id: int
    status: str
    created_at: datetime

    class Config:
        from_attributes = True
        