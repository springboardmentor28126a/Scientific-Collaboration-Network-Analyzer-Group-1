from pydantic import BaseModel


class PaperCreate(BaseModel):
    title: str
    abstract: str
    authors: str
    keywords: str
    publication_year: int
    journal: str
    publication_type: str
    publication_status: str
    pdf_file: str


class PaperUpdate(BaseModel):
    title: str
    abstract: str
    authors: str
    keywords: str
    publication_year: int
    journal: str
    publication_type: str
    publication_status: str
    pdf_file: str


class PaperResponse(BaseModel):
    id: int
    title: str
    abstract: str
    authors: str
    keywords: str
    publication_year: int
    journal: str
    publication_type: str
    publication_status: str
    pdf_file: str

    class Config:
        from_attributes = True