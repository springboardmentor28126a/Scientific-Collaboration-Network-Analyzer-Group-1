from pydantic import BaseModel
from datetime import date


class ProjectCreate(BaseModel):
    title: str
    description: str
    start_date: date
    end_date: date
    status: str
    funding_agency: str
    budget: int
    principal_investigator_id: int


class ProjectUpdate(BaseModel):
    title: str
    description: str
    start_date: date
    end_date: date
    status: str
    funding_agency: str
    budget: int
    principal_investigator_id: int


class ProjectResponse(BaseModel):
    id: int
    title: str
    description: str
    start_date: date
    end_date: date
    status: str
    funding_agency: str
    budget: int
    principal_investigator_id: int

    class Config:
        from_attributes = True