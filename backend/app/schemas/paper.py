from pydantic import BaseModel
from typing import List

class PaperCreate(BaseModel):
    title: str
    abstract: str
    authors: str
    researcher_ids: List[int] = []
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
    researcher_ids: List[int] = []
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
    researcher_ids: List[int] = []
    keywords: str
    publication_year: int
    journal: str
    publication_type: str
    publication_status: str
    pdf_file: str

    class Config:
        from_attributes = True