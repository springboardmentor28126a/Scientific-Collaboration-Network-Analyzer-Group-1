from pydantic import BaseModel


class ReferenceBase(BaseModel):
    paper_id: int
    title: str
    authors: str
    publication_year: int
    journal: str | None = None
    doi: str | None = None


class ReferenceCreate(ReferenceBase):
    pass


class ReferenceUpdate(ReferenceBase):
    pass


class ReferenceResponse(ReferenceBase):
    id: int

    class Config:
        from_attributes = True