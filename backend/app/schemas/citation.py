from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class CitationBase(BaseModel):
    publication_id: int
    title: str
    authors: str
    journal: Optional[str] = None
    year: Optional[int] = None
    doi: Optional[str] = None
    url: Optional[str] = None


class CitationCreate(CitationBase):
    pass


class CitationUpdate(BaseModel):
    title: Optional[str] = None
    authors: Optional[str] = None
    journal: Optional[str] = None
    year: Optional[int] = None
    doi: Optional[str] = None
    url: Optional[str] = None


class CitationResponse(CitationBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)