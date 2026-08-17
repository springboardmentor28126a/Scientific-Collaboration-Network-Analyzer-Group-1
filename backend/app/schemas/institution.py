from pydantic import BaseModel
from typing import Optional


class InstitutionBase(BaseModel):
    institution_name: str
    institution_type: Optional[str] = None
    country: Optional[str] = None
    state: Optional[str] = None
    city: Optional[str] = None
    address: Optional[str] = None
    website: Optional[str] = None
    email: Optional[str] = None
    contact_number: Optional[str] = None
    status: Optional[str] = "Active"


class InstitutionCreate(InstitutionBase):
    pass


class InstitutionUpdate(InstitutionBase):
    pass


class InstitutionResponse(InstitutionBase):
    id: int

    class Config:
        from_attributes = True