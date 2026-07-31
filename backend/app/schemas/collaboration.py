from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict

from app.utils.constants import CollaborationStatus


class CollaborationCreate(BaseModel):
    recipient_researcher_id: int
    publication_id: Optional[int] = None
    message: Optional[str] = None


class CollaborationDecision(BaseModel):
    accept: bool


class ResearcherBrief(BaseModel):
    id: int
    first_name: str
    last_name: str
    designation: Optional[str] = None
    institution_id: int

    model_config = ConfigDict(from_attributes=True)


class PublicationBrief(BaseModel):
    id: int
    title: str

    model_config = ConfigDict(from_attributes=True)


class CollaborationResponse(BaseModel):
    id: int
    status: CollaborationStatus
    message: Optional[str] = None
    created_at: datetime
    responded_at: Optional[datetime] = None
    requester: ResearcherBrief
    recipient: ResearcherBrief
    publication: Optional[PublicationBrief] = None

    model_config = ConfigDict(from_attributes=True)