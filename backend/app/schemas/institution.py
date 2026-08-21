from pydantic import BaseModel
from typing import Optional

class InstitutionBase(BaseModel):
    name: str
    type: str
    address: str
    website: Optional[str] = None

class InstitutionCreate(InstitutionBase):
    pass

class InstitutionUpdate(InstitutionBase):
    pass

class InstitutionResponse(InstitutionBase):
    id: str

    class Config:
        from_attributes = True
