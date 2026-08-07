from pydantic import BaseModel
from typing import Optional


class NotificationCreate(BaseModel):
    user_id: Optional[int] = None
    title: str
    message: str
    type: Optional[str] = "info"


class NotificationResponse(BaseModel):
    id: int
    user_id: Optional[int] = None
    title: str
    message: str
    type: str
    is_read: bool
    created_at: Optional[str] = None

    class Config:
        from_attributes = True
