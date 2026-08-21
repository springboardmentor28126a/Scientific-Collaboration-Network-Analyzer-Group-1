from pydantic import BaseModel


class ProjectAssignmentCreate(BaseModel):
    project_id: int
    researcher_id: int
    role: str


class ProjectAssignmentUpdate(BaseModel):
    project_id: int
    researcher_id: int
    role: str


class ProjectAssignmentResponse(BaseModel):
    id: int
    project_id: int
    researcher_id: int
    role: str

    class Config:
        from_attributes = True