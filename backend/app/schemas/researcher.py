from pydantic import BaseModel, EmailStr


class ResearcherCreate(BaseModel):
    name: str
    email: EmailStr
    university: str
    department: str
    designation: str
    experience: int
    phone: str
    research_interests: str
    skills: str
    bio: str


class ResearcherResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    university: str
    department: str
    designation: str
    experience: int
    phone: str
    research_interests: str
    skills: str
    bio: str

    class Config:
        from_attributes = True


class ResearcherUpdate(BaseModel):
    name: str
    email: EmailStr
    university: str
    department: str
    designation: str
    experience: int
    phone: str
    research_interests: str
    skills: str
    bio: str