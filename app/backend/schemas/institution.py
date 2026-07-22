from pydantic import BaseModel, EmailStr


class InstitutionBase(BaseModel):
    name: str
    institution_type: str | None = None
    country: str | None = None
    state: str | None = None
    city: str | None = None
    address: str | None = None
    website: str | None = None
    contact_email: EmailStr | None = None
    phone: str | None = None
    established_year: int | None = None


class InstitutionCreate(InstitutionBase):
    pass


class InstitutionUpdate(InstitutionBase):
    pass


class InstitutionResponse(InstitutionBase):
    id: int

    class Config:
        from_attributes = True