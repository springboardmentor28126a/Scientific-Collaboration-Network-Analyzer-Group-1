from pydantic import BaseModel, ConfigDict
from typing import Optional


class ResearcherCreate(BaseModel):
    user_id: int
    institution_id: int
    department_id: int
    first_name: str
    last_name: str
    designation: str
    qualification: str
    research_interests: Optional[str] = None
    skills: Optional[str] = None
    biography: Optional[str] = None
    profile_image: Optional[str] = None

class ResearcherUpdate(BaseModel):
    department_id: Optional[int] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    designation: Optional[str] = None
    qualification: Optional[str] = None
    research_interests: Optional[str] = None
    skills: Optional[str] = None
    biography: Optional[str] = None
    profile_image: Optional[str] = None

class ResearcherResponse(BaseModel):
    id: int
    user_id: int
    institution_id: int
    department_id: int
    first_name: str
    last_name: str
    designation: Optional[str] = None
    qualification: Optional[str] = None
    research_interests: Optional[str] = None
    skills: Optional[str] = None
    biography: Optional[str] = None
    profile_image: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)