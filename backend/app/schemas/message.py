from datetime import datetime
from pydantic import BaseModel, ConfigDict


class MessageCreate(BaseModel):
    content: str


class SenderBrief(BaseModel):
    id: int
    first_name: str
    last_name: str

    model_config = ConfigDict(from_attributes=True)


class MessageResponse(BaseModel):
    id: int
    collaboration_id: int
    content: str
    created_at: datetime
    sender: SenderBrief

    model_config = ConfigDict(from_attributes=True)