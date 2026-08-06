from pydantic import BaseModel


class ResearchProjectCreate(BaseModel):
    title: str
    description: str | None = None
    funding_agency: str | None = None
    budget: str | None = None
    start_date: str | None = None
    end_date: str | None = None
    status: str = "Active"
    institution_name: str | None = None


class ResearchProjectResponse(ResearchProjectCreate):
    id: int

    class Config:
        from_attributes = True


class ProjectAssignmentCreate(BaseModel):
    project_id: int
    researcher_id: int
    role: str = "Member"


class ProjectAssignmentResponse(ProjectAssignmentCreate):
    id: int

    class Config:
        from_attributes = True
