from pydantic import BaseModel
from typing import Optional


class ResearcherCreate(BaseModel):
    user_id: int

    phone: str
    department: str
    institution: str
    designation: str
    research_interest: str
    skills: str
    bio: str
    linkedin: str
    orcid: str
    google_scholar: str

    country: Optional[str] = ""   # was required with no default — that's what caused the 422


class ResearcherResponse(BaseModel):
    id: int
    user_id: int

    phone: str
    department: str
    institution: str
    designation: str
    research_interest: str
    skills: str
    bio: str
    linkedin: str
    orcid: str
    google_scholar: str
    country: Optional[str] = ""

    class Config:
        from_attributes = True