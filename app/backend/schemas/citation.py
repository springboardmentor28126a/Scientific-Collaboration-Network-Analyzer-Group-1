from pydantic import BaseModel, ConfigDict


# ---------------------------------------------------------
# Base Schema
# ---------------------------------------------------------

class CitationBase(BaseModel):
    publication_id: int
    cited_publication_id: int | None = None
    citation_text: str
    reference_order: int | None = None


# ---------------------------------------------------------
# Create Schema
# ---------------------------------------------------------

class CitationCreate(CitationBase):
    pass


# ---------------------------------------------------------
# Update Schema
# ---------------------------------------------------------

class CitationUpdate(BaseModel):
    publication_id: int | None = None
    cited_publication_id: int | None = None
    citation_text: str | None = None
    reference_order: int | None = None


# ---------------------------------------------------------
# Response Schema
# ---------------------------------------------------------

class CitationResponse(CitationBase):
    id: int

    model_config = ConfigDict(
        from_attributes=True
    )