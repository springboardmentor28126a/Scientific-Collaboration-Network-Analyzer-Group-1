from pydantic import BaseModel


class ResearcherCreate(BaseModel):
    department: str
    institution: str
    research_interest: str
    skills: str


class ResearcherResponse(BaseModel):
    id: int
    department: str
    institution: str
    research_interest: str
    skills: str

    class Config:
        from_attributes = True