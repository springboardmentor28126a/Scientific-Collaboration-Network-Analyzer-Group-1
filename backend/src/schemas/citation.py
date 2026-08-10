from pydantic import BaseModel
from typing import Optional


class CitationBase(BaseModel):
    title: str
    authors: str
    publication_year: int
    journal: Optional[str] = None
    doi: Optional[str] = None
    url: Optional[str] = None
    citation_type: str
    notes: Optional[str] = None


class CitationCreate(CitationBase):
    pass


class CitationUpdate(BaseModel):
    title: Optional[str] = None
    authors: Optional[str] = None
    publication_year: Optional[int] = None
    journal: Optional[str] = None
    doi: Optional[str] = None
    url: Optional[str] = None
    citation_type: Optional[str] = None
    notes: Optional[str] = None


class CitationResponse(CitationBase):
    id: int

    class Config:
        from_attributes = True