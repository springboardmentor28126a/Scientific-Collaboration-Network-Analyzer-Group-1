from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class PublicationCreate(BaseModel):
    title: str
    authors: str
    journal: str
    publication_year: int
    doi: Optional[str] = None
    keywords: str
    publication_type: str = "Journal Article"
    abstract: Optional[str] = None
    pdf_file: Optional[str] = None
    conference_id: Optional[int] = None
    institution_id: Optional[int] = None
    selected_reviewer_id: Optional[int] = None


class PublicationReview(BaseModel):
    review_comments: Optional[str] = None


class PublicationResponse(PublicationCreate):
    model_config = ConfigDict(from_attributes=True)

    id: int
    status: str
    researcher_id: Optional[int] = None
    institution_id: Optional[int] = None
    uploaded_at: Optional[datetime] = None
    reviewed_by: Optional[int] = None
    reviewed_at: Optional[datetime] = None
    review_comments: Optional[str] = None
