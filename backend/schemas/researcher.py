from pydantic import BaseModel


class ResearcherCreate(BaseModel):
    user_id: int

    phone: str | int = ""

    department: str = ""

    institution: str = ""

    designation: str = ""

    research_interests: str = ""

    skills: str = ""

    bio: str = ""

    linkedin: str = ""

    orcid: str = ""

    google_scholar: str = ""
    country: str = ""
    aishe_code: str | None = None
    state: str | None = None
    district: str | None = None
    pincode: str | None = None
    institution_type: str | None = None


class ResearcherResponse(BaseModel):
    id: int

    user_id: int

    phone: str | int = ""

    department: str = ""

    institution: str = ""

    aishe_code: str | None = None
    state: str | None = None
    district: str | None = None
    pincode: str | None = None
    institution_type: str | None = None

    designation: str = ""

    research_interests: str = ""
    
    skills: str = ""

    bio: str = ""

    linkedin: str = ""

    orcid: str = ""

    google_scholar: str = ""
    country: str = ""

    class Config:
        from_attributes = True
