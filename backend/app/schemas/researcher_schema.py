from pydantic import BaseModel


class ResearcherCreate(BaseModel):
    institution: str
    department: str
    research_interest: str
    bio: str