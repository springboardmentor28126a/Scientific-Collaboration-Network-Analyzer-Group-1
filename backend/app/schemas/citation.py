from pydantic import BaseModel


class CitationCreate(BaseModel):
    paper_id: int
    cited_paper_title: str
    authors: str
    publication_year: int
    doi: str | None = None
    citation_count: int = 0


class CitationUpdate(BaseModel):
    paper_id: int
    cited_paper_title: str
    authors: str
    publication_year: int
    doi: str | None = None
    citation_count: int


class CitationResponse(BaseModel):
    id: int
    paper_id: int
    cited_paper_title: str
    authors: str
    publication_year: int
    doi: str | None = None
    citation_count: int

    class Config:
        from_attributes = True