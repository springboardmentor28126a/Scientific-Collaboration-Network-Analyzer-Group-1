from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class GroupInvitationCreate(BaseModel):
    group_id: int
    sender_id: int
    receiver_id: int


class GroupInvitationResponse(BaseModel):
    id: int
    group_id: int
    sender_id: int
    receiver_id: int
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class GroupInvitationListResponse(BaseModel):
    id: int

    group_id: int
    group_name: str

    sender_id: int
    sender_name: str

    receiver_id: int

    status: str

    created_at: datetime

    class Config:
        from_attributes = True