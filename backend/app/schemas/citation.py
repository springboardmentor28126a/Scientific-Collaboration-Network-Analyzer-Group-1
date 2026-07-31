from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class CitationCreate(BaseModel):
    cited_title: str
    cited_authors: Optional[str] = None
    cited_year: Optional[int] = None
    cited_source: Optional[str] = None
    cited_doi: Optional[str] = None
    cited_url: Optional[str] = None
    notes: Optional[str] = None


class CitationUpdate(BaseModel):
    cited_title: Optional[str] = None
    cited_authors: Optional[str] = None
    cited_year: Optional[int] = None
    cited_source: Optional[str] = None
    cited_doi: Optional[str] = None
    cited_url: Optional[str] = None
    notes: Optional[str] = None


class CitationResponse(BaseModel):
    id: int
    publication_id: int
    cited_title: str
    cited_authors: Optional[str] = None
    cited_year: Optional[int] = None
    cited_source: Optional[str] = None
    cited_doi: Optional[str] = None
    cited_url: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)