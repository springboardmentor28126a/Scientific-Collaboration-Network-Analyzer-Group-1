from typing import Optional
from pydantic import BaseModel


class ResearcherCreate(BaseModel):
    institution_id: Optional[int] = None
    department: str
    academic_position: Optional[str] = None
    research_interest: str
    bio: str