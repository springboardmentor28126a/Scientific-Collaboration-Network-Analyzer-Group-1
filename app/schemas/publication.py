from datetime import datetime
from typing import Optional, List

from pydantic import BaseModel, ConfigDict

from app.utils.constants import PublicationStatus, PublicationType


class PublicationCreate(BaseModel):
    title: str
    publication_type: PublicationType = PublicationType.JOURNAL_PAPER
    conference_id: Optional[int] = None
    abstract: Optional[str] = None
    authors_text: Optional[str] = None
    publish_date: Optional[datetime] = None
    doi: Optional[str] = None
    external_link: Optional[str] = None
    coauthor_researcher_ids: Optional[List[int]] = []


class PublicationUpdate(BaseModel):
    title: Optional[str] = None
    publication_type: Optional[PublicationType] = None
    conference_id: Optional[int] = None
    abstract: Optional[str] = None
    authors_text: Optional[str] = None
    publish_date: Optional[datetime] = None
    doi: Optional[str] = None
    external_link: Optional[str] = None
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
    title: str
    publication_type: PublicationType
    conference_id: Optional[int] = None
    abstract: Optional[str]
    authors_text: Optional[str]
    publish_date: Optional[datetime]
    doi: Optional[str]
    external_link: Optional[str]
    file_path: Optional[str] = None
    status: PublicationStatus
    reviewer_id: Optional[int]
    review_comments: Optional[str]
    reviewed_at: Optional[datetime]
    created_at: datetime
    coauthors: List[CoauthorBrief] = []
    is_owner: bool = True
    model_config = ConfigDict(from_attributes=True)


class PublicationBrowseResponse(BaseModel):
    id: int
    title: str
    publication_type: PublicationType
    status: str
    conference_id: Optional[int] = None
    abstract: Optional[str]
    authors_text: Optional[str]
    publish_date: Optional[datetime]
    doi: Optional[str]
    external_link: Optional[str]
    file_path: Optional[str] = None
    owner_first_name: str
    owner_last_name: str
    owner_institution_id: int
    coauthors: List[CoauthorBrief] = []

    model_config = ConfigDict(from_attributes=True)