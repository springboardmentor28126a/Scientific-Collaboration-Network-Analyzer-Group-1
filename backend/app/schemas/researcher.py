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


class ResearcherResponse(BaseModel):
    id: int
    user_id: int
    institution_id: int
    department_id: int
    first_name: str
    last_name: str
    designation: str
    qualification: str
    research_interests: Optional[str]
    skills: Optional[str]
    biography: Optional[str]
    profile_image: Optional[str]

    model_config = ConfigDict(from_attributes=True)