from pydantic import BaseModel
from typing import Optional
from datetime import date

class CollaborationBase(BaseModel):
    researcher_id: str
    partner_researcher_id: str
    institution_id: Optional[str] = None
    partner_institution_id: Optional[str] = None
    project_id: Optional[str] = None
    status: str = "Active"
    collaborated_at: date

class CollaborationCreate(CollaborationBase):
    pass

class CollaborationResponse(CollaborationBase):
    id: str

    class Config:
        from_attributes = True
