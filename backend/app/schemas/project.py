from pydantic import BaseModel
from typing import Optional
from datetime import date

class ProjectBase(BaseModel):
    title: str
    description: Optional[str] = None
    funding_agency: Optional[str] = None
    budget: int = 0
    lead_researcher_id: Optional[str] = None
    institution_id: Optional[str] = None
    status: str = "Active"
    start_date: date
    end_date: Optional[date] = None

class ProjectCreate(ProjectBase):
    pass

class ProjectResponse(ProjectBase):
    id: str

    class Config:
        from_attributes = True
