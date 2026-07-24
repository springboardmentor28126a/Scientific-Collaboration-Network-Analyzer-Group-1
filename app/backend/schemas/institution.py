from pydantic import BaseModel, EmailStr


class InstitutionBase(BaseModel):
    name: str
    institution_type: str | None = None
    country: str | None = None
    city: str | None = None
    website: str | None = None
    contact_email: EmailStr | None = None


class InstitutionCreate(InstitutionBase):
    pass


class InstitutionResponse(InstitutionBase):
    id: int

    class Config:
        from_attributes = True
