from pydantic import BaseModel, ConfigDict
from datetime import datetime


class CitationCreate(BaseModel):
    citing_publication_id: int
    cited_publication_id: int


class CitedPublicationSummary(BaseModel):
    """Read-only publication data used to render a reference card."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    authors: str | None = None
    publication_year: int | None = None
    journal: str | None = None
    doi: str | None = None


class CitationResponse(CitationCreate):
    id: int
    created_at: datetime
    cited_publication: CitedPublicationSummary | None = None

    class Config:
        from_attributes = True


class BulkCitationCreate(BaseModel):
    citing_publication_id: int
    cited_publication_ids: list[int]


class CitationStatsResponse(BaseModel):
    publication_id: int
    title: str
    times_cited: int
    reference_count: int
