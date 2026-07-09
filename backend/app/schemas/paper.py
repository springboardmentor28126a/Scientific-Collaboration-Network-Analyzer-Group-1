from pydantic import BaseModel


class PaperCreate(BaseModel):
    title: str
    abstract: str
    authors: str
    keywords: str
    publication_year: int
    journal: str


class PaperUpdate(BaseModel):
    title: str
    abstract: str
    authors: str
    keywords: str
    publication_year: int
    journal: str


class PaperResponse(BaseModel):
    id: int
    title: str
    abstract: str
    authors: str
    keywords: str
    publication_year: int
    journal: str

    class Config:
        from_attributes = True