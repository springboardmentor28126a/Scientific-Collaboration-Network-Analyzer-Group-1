from pydantic import BaseModel, EmailStr
from typing import Optional


# =========================
# CREATE RESEARCHER
# =========================

class ResearcherCreate(BaseModel):
    name: str
    email: EmailStr
    university: str
    department: str
    designation: Optional[str] = None
    experience: Optional[int] = None
    phone: Optional[str] = None
    research_interests: Optional[str] = None
    skills: Optional[str] = None
    bio: Optional[str] = None


# =========================
# RESEARCHER RESPONSE
# =========================

class ResearcherResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    university: str
    department: str
    designation: Optional[str] = None
    experience: Optional[int] = None
    phone: Optional[str] = None
    research_interests: Optional[str] = None
    skills: Optional[str] = None
    bio: Optional[str] = None

    class Config:
        from_attributes = True


# =========================
# UPDATE RESEARCHER
# =========================

class ResearcherUpdate(BaseModel):
    name: str
    email: EmailStr
    university: str
    department: str
    designation: Optional[str] = None
    experience: Optional[int] = None
    phone: Optional[str] = None
    research_interests: Optional[str] = None
    skills: Optional[str] = None
    bio: Optional[str] = None