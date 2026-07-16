from pydantic import BaseModel
from typing import Optional

class InstitutionBase(BaseModel):
    institution_name: str
    institution_type: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    website: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    description: Optional[str] = None
    logo: Optional[str] = None

class InstitutionCreate(InstitutionBase):
    pass

class InstitutionUpdate(InstitutionBase):
    pass

class InstitutionResponse(InstitutionBase):
    id: int
    created_by: int

    class Config:
        from_attributes = True
