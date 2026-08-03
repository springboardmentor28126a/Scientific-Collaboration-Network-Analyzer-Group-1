
from typing import Optional

from pydantic import BaseModel
from datetime import datetime

class PublicationCreate(BaseModel):
    title: str
    authors: str
    journal: str
    publication_year: int
    doi: str
    keywords: str

    publication_type: str = "Journal Article"
    abstract: Optional[str] = None
    pdf_file: Optional[str] = None
    conference_id: Optional[int] = None
    selected_reviewer_id: Optional[int] = None


class PublicationReview(BaseModel):
    review_comments: Optional[str] = None


class PublicationResponse(BaseModel):
    id: int

    title: str
    authors: str
    journal: str
    publication_year: int
    doi: str
    keywords: str

    status: str

    abstract: Optional[str] = None
    pdf_file: Optional[str] = None

    researcher_id: Optional[int] = None
    abstract: str | None = None

    pdf_file: str | None = None
    institution_id: int | None = None
    conference_id: int | None = None

class PublicationResponse(PublicationCreate):
    id: int
    abstract: str | None = None

    pdf_file: str | None = None
    uploaded_at: datetime | None = None
    institution_id: int | None = None
    conference_id: int | None = None
    class Config:
        from_attributes = True
