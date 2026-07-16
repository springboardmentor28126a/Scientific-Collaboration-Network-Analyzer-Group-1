from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class PublicationBase(BaseModel):
    title: str
    abstract: Optional[str] = None
    keywords: Optional[str] = None
    authors: str
    journal: Optional[str] = None
    conference: Optional[str] = None
    publication_year: int
    doi: Optional[str] = None
    file_path: Optional[str] = None
    publication_type: str = "Journal Paper"
    publication_status: str = "Published"

class PublicationCreate(PublicationBase):
    pass

class PublicationUpdate(BaseModel):
    title: Optional[str] = None
    abstract: Optional[str] = None
    keywords: Optional[str] = None
    authors: Optional[str] = None
    journal: Optional[str] = None
    conference: Optional[str] = None
    publication_year: Optional[int] = None
    doi: Optional[str] = None
    file_path: Optional[str] = None
    publication_type: Optional[str] = None
    publication_status: Optional[str] = None

class PublicationResponse(PublicationBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True
