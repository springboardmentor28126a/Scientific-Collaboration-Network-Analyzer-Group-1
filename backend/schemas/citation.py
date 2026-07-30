from pydantic import BaseModel
from datetime import datetime


class CitationCreate(BaseModel):
    citing_publication_id: int
    cited_publication_id: int


class CitationResponse(CitationCreate):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True