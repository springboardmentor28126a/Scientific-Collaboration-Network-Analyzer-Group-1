from pydantic import BaseModel

class ResearcherCreate(BaseModel):
    user_id: int
    full_name: str
    department: str
    institution: str
    designation: str
    research_interest: str


class ResearcherResponse(BaseModel):
    id: int
    user_id: int
    full_name: str
    department: str
    institution: str
    designation: str
    research_interest: str

    class Config:
        from_attributes = True