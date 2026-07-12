from pydantic import BaseModel


class CollaborationCreate(BaseModel):

    sender_id: int

    receiver_id: int

    message: str | None = None


class CollaborationResponse(BaseModel):

    id: int

    sender_id: int

    receiver_id: int

    status: str

    message: str | None = None

    class Config:

        from_attributes = True