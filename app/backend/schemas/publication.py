from pydantic import BaseModel, ConfigDict


# ---------------------------------------------------------
# Base Schema
# ---------------------------------------------------------

class PublicationBase(BaseModel):
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


# ---------------------------------------------------------
# Create Schema
# ---------------------------------------------------------

class PublicationCreate(PublicationBase):
    pass


# ---------------------------------------------------------
# Update Schema
# ---------------------------------------------------------

class PublicationUpdate(BaseModel):
    researcher_id: int | None = None
    title: str | None = None
    authors: str | None = None
    abstract: str | None = None
    citation_count: int | None = None
    publication_type: str | None = None
    publication_name: str | None = None
    publication_year: int | None = None
    doi: str | None = None
    status: str | None = None
    upload_path: str | None = None


# ---------------------------------------------------------
# Response Schema
# ---------------------------------------------------------

class PublicationResponse(PublicationBase):
    id: int

    model_config = ConfigDict(
        from_attributes=True
    )