from datetime import date
from pydantic import BaseModel, ConfigDict


# ---------------------------------------------------------
# Research Project
# ---------------------------------------------------------

class ResearchProjectBase(BaseModel):
    title: str
    description: str | None = None
    funding_agency: str | None = None
    budget: str | None = None
    start_date: date | None = None
    end_date: date | None = None
    status: str = "Active"
    institution_name: str | None = None


class ResearchProjectCreate(ResearchProjectBase):
    pass


class ResearchProjectUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    funding_agency: str | None = None
    budget: str | None = None
    start_date: date | None = None
    end_date: date | None = None
    status: str | None = None
    institution_name: str | None = None


class ResearchProjectResponse(ResearchProjectBase):
    id: int

    model_config = ConfigDict(
        from_attributes=True
    )


# ---------------------------------------------------------
# Project Assignment
# ---------------------------------------------------------

class ProjectAssignmentBase(BaseModel):
    project_id: int
    researcher_id: int
    role: str = "Member"


class ProjectAssignmentCreate(ProjectAssignmentBase):
    pass


class ProjectAssignmentUpdate(BaseModel):
    project_id: int | None = None
    researcher_id: int | None = None
    role: str | None = None


class ProjectAssignmentResponse(ProjectAssignmentBase):
    id: int

    model_config = ConfigDict(
        from_attributes=True
    )