from pydantic import BaseModel


class CitationCreate(BaseModel):
    publication_id: int
    cited_publication_id: int | None = None
    citation_text: str
    doi: str | None = None
    reference_order: int | None = None


class CitationResponse(CitationCreate):
    id: int

    class Config:
        from_attributes = True
