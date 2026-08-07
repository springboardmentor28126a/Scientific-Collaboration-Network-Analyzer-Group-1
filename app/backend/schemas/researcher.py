from pydantic import BaseModel


class ResearcherCreate(BaseModel):
    user_id: int
    full_name: str
    academic_profile: str
    department: str
    institution: str
    skills: str
    research_interest: str
    affiliations: str


class ResearcherResponse(BaseModel):
    id: int
    user_id: int
    full_name: str
    academic_profile: str
    department: str
    institution: str
    skills: str
    research_interest: str
    affiliations: str

    class Config:
        from_attributes = True