from pydantic import BaseModel


class PublicationAuthorCreate(BaseModel):
    publication_id: int
    researcher_id: int
    author_order: int | None = None
    contribution: str | None = None


class PublicationAuthorResponse(PublicationAuthorCreate):
    id: int

    class Config:
        from_attributes = True


class CollaborationCreate(BaseModel):
    title: str
    collaboration_type: str
    primary_researcher_id: int | None = None
    partner_researcher_id: int | None = None
    institution_name: str | None = None
    status: str = "Active"


class CollaborationResponse(CollaborationCreate):
    id: int

    class Config:
        from_attributes = True
