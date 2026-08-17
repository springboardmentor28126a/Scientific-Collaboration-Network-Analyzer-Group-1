from pydantic import BaseModel


class InstitutionCollaborationCreate(BaseModel):
    institution_a_id: int
    institution_b_id: int
    collaboration_type: str
    status: str


class InstitutionCollaborationUpdate(BaseModel):
    institution_a_id: int
    institution_b_id: int
    collaboration_type: str
    status: str


class InstitutionCollaborationResponse(BaseModel):
    id: int
    institution_a_id: int
    institution_b_id: int
    collaboration_type: str
    status: str

    class Config:
        from_attributes = True