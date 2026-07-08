from pydantic import BaseModel


class PublicationCreate(BaseModel):
    researcher_id: int
    title: str
    publication_type: str
    publication_name: str
    publication_year: int
    doi: str
    status: str
    upload_path: str


class PublicationResponse(BaseModel):
    id: int
    researcher_id: int
    title: str
    publication_type: str
    publication_name: str
    publication_year: int
    doi: str
    status: str
    upload_path: str

    class Config:
        from_attributes = True