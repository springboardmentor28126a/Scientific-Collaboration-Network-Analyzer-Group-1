from pydantic import BaseModel, ConfigDict

# ---------------------------------------------------------
# Publication Author
# ---------------------------------------------------------

class PublicationAuthorBase(BaseModel):
    publication_id: int
    researcher_id: int
    author_order: int | None = None
    contribution: str | None = None


class PublicationAuthorCreate(PublicationAuthorBase):
    pass


class PublicationAuthorUpdate(BaseModel):
    publication_id: int | None = None
    researcher_id: int | None = None
    author_order: int | None = None
    contribution: str | None = None


class PublicationAuthorResponse(PublicationAuthorBase):
    id: int

    model_config = ConfigDict(
        from_attributes=True
    )


# ---------------------------------------------------------
# Collaboration
# ---------------------------------------------------------

class CollaborationBase(BaseModel):
    title: str
    collaboration_type: str
    primary_researcher_id: int | None = None
    partner_researcher_id: int | None = None
    institution_name: str | None = None
    status: str = "Active"


class CollaborationCreate(CollaborationBase):
    pass


class CollaborationUpdate(BaseModel):
    title: str | None = None
    collaboration_type: str | None = None
    primary_researcher_id: int | None = None
    partner_researcher_id: int | None = None
    institution_name: str | None = None
    status: str | None = None


class CollaborationResponse(CollaborationBase):
    id: int

    model_config = ConfigDict(
        from_attributes=True
    )