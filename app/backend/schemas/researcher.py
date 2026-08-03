from pydantic import BaseModel, ConfigDict


# ---------------------------------------------------------
# Base Schema
# ---------------------------------------------------------

class ResearcherBase(BaseModel):
    user_id: int
    full_name: str
    academic_profile: str
    department: str
    institution: str
    skills: str
    research_interest: str
    affiliations: str


# ---------------------------------------------------------
# Create Schema
# ---------------------------------------------------------

class ResearcherCreate(ResearcherBase):
    pass


# ---------------------------------------------------------
# Update Schema
# ---------------------------------------------------------

class ResearcherUpdate(BaseModel):
    user_id: int | None = None
    full_name: str | None = None
    academic_profile: str | None = None
    department: str | None = None
    institution: str | None = None
    skills: str | None = None
    research_interest: str | None = None
    affiliations: str | None = None


# ---------------------------------------------------------
# Response Schema
# ---------------------------------------------------------

class ResearcherResponse(ResearcherBase):
    id: int

    model_config = ConfigDict(
        from_attributes=True
    )