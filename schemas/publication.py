
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
    status: str
    researcher_id: Optional[int] = None
    abstract: str | None = None

    pdf_file: str | None = None


class PublicationResponse(PublicationCreate):
    id: int
    abstract: str | None = None

    pdf_file: str | None = None
    uploaded_at: datetime | None = None

    class Config:
        from_attributes = True