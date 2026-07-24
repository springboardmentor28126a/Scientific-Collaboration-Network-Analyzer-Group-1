from pydantic import BaseModel


class PublicationCreate(BaseModel):
    researcher_id: int
    title: str
    authors: str | None = None
    abstract: str | None = None
    citation_count: int = 0
    publication_type: str
    publication_name: str
    publication_year: int
    doi: str | None = None
    status: str = "Draft"
    upload_path: str | None = None


class PublicationResponse(BaseModel):
    id: int
    researcher_id: int
    title: str
    authors: str | None = None
    abstract: str | None = None
    citation_count: int = 0
    publication_type: str
    publication_name: str
    publication_year: int
    doi: str | None = None
    status: str
    upload_path: str | None = None

    class Config:
        from_attributes = True
