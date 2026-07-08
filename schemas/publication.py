from typing import Optional
from pydantic import BaseModel


class PublicationCreate(BaseModel):
    title: str
    authors: str
    journal: str
    publication_year: int
    doi: str
    keywords: str
    status: str
    researcher_id: Optional[int] = None


class PublicationResponse(PublicationCreate):
    id: int

    class Config:
        from_attributes = True