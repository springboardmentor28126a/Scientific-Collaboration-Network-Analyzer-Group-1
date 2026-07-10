from pydantic import BaseModel


class ResearcherProfileCreate(BaseModel):
    user_id: int
    institution_id: int
    department_id: int
    designation: str
    research_area: str
    bio: str


class ResearcherProfileResponse(BaseModel):
    id: int
    user_id: int
    institution_id: int
    department_id: int
    designation: str
    research_area: str
    bio: str

    class Config:
        from_attributes = True