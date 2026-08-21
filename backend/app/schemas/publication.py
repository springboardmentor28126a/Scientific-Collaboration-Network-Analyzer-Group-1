from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime

class PublicationBase(BaseModel):
    title: str
    abstract: Optional[str] = None
    pub_type: str
    status: str = "Draft"
    authors: str
    doi: Optional[str] = None
    journal_conference: Optional[str] = None
    citation_count: int = 0
    institution_id: Optional[str] = None
    published_date: Optional[date] = None

class PublicationCreate(PublicationBase):
    pass

class PublicationResponse(PublicationBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True
