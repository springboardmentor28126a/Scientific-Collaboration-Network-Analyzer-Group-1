from pydantic import BaseModel, ConfigDict


class CitationBase(BaseModel):
    publication_id: int
    cited_publication_id: int | None = None
    citation_text: str
    reference_order: int | None = None


class CitationCreate(CitationBase):
    pass


class CitationResponse(CitationBase):
    id: int

    model_config = ConfigDict(from_attributes=True)