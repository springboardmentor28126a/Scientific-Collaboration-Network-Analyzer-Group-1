from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class ResearchGroupCreate(BaseModel):
    name: str
    description: Optional[str] = None
    visibility: str = "Private"
    created_by: int


class ResearchGroupResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    visibility: str
    created_by: int
    created_at: datetime

    class Config:
        from_attributes = True

class GroupMemberResponse(BaseModel):
    user_id: int
    name: str
    email: str
    role: str
    institution: str | None = None

    class Config:
        from_attributes = True


class MyGroupResponse(BaseModel):
    id: int
    name: str
    description: str | None = None
    visibility: str
    role: str
    member_count: int
    created_at: datetime

    class Config:
        from_attributes = True

class ResearchGroupUpdate(BaseModel):
    name: str
    description: str | None = None
    visibility: str

class ResearchGroupDetailsResponse(BaseModel):
    id: int
    name: str
    description: str | None = None
    created_by: int
    created_by_name: str
    member_count: int
    created_at: datetime

    class Config:
        from_attributes = True