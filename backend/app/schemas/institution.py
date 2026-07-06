from pydantic import BaseModel, ConfigDict
from typing import Optional


class InstitutionCreate(BaseModel):
    institution_name: str
    email: str
    phone: Optional[str] = None
    website: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None


class InstitutionResponse(BaseModel):
    id: int
    institution_name: str
    email: str
    phone: Optional[str]
    website: Optional[str]
    address: Optional[str]
    city: Optional[str]
    state: Optional[str]
    country: Optional[str]

    model_config = ConfigDict(
        from_attributes=True
    )