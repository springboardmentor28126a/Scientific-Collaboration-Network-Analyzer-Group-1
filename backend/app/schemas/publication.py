from datetime import datetime
from typing import Optional, List

from pydantic import BaseModel, ConfigDict

from app.utils.constants import PublicationStatus


class PublicationCreate(BaseModel):
    title: str
    abstract: Optional[str] = None
    authors_text: Optional[str] = None
    publish_date: Optional[datetime] = None
    doi: Optional[str] = None
    external_link: Optional[str] = None
    conference_id: Optional[int] = None
    coauthor_researcher_ids: Optional[List[int]] = []
    


class PublicationUpdate(BaseModel):
    title: Optional[str] = None
    abstract: Optional[str] = None
    authors_text: Optional[str] = None
    publish_date: Optional[datetime] = None
    doi: Optional[str] = None
    external_link: Optional[str] = None
    conference_id: Optional[int] = None
    coauthor_researcher_ids: Optional[List[int]] = None


class ReviewDecision(BaseModel):
    approve: bool
    comments: Optional[str] = None


class CoauthorBrief(BaseModel):
    id: int
    first_name: str
    last_name: str

    model_config = ConfigDict(from_attributes=True)


class PublicationResponse(BaseModel):
    id: int
    owner_researcher_id: int
    conference_id: Optional[int]
    title: str
    abstract: Optional[str]
    authors_text: Optional[str]
    publish_date: Optional[datetime]
    doi: Optional[str]
    external_link: Optional[str]
    status: PublicationStatus
    reviewer_id: Optional[int]
    review_comments: Optional[str]
    reviewed_at: Optional[datetime]
    created_at: datetime
    coauthors: List[CoauthorBrief] = []

    model_config = ConfigDict(from_attributes=True)