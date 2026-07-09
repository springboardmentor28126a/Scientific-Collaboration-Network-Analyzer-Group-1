from pydantic import BaseModel


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

    class Config:
        from_attributes = True