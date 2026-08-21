from pydantic import BaseModel
from typing import Optional

class ResearcherBase(BaseModel):
    name: str
    email: str
    role: str = "Researcher"
    institution_id: Optional[str] = None
    department: Optional[str] = None

class ResearcherCreate(ResearcherBase):
    pass

class ResearcherResponse(ResearcherBase):
    id: str

    class Config:
        from_attributes = True
