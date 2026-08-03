from pydantic import BaseModel, ConfigDict, EmailStr


# ---------------------------------------------------------
# Base Schema
# ---------------------------------------------------------

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


# ---------------------------------------------------------
# Create Schema
# ---------------------------------------------------------

class InstitutionCreate(InstitutionBase):
    pass


# ---------------------------------------------------------
# Update Schema
# ---------------------------------------------------------

class InstitutionUpdate(BaseModel):
    name: str | None = None
    institution_type: str | None = None
    country: str | None = None
    state: str | None = None
    city: str | None = None
    address: str | None = None
    website: str | None = None
    contact_email: EmailStr | None = None
    phone: str | None = None
    established_year: int | None = None


# ---------------------------------------------------------
# Response Schema
# ---------------------------------------------------------

class InstitutionResponse(InstitutionBase):
    id: int

    model_config = ConfigDict(
        from_attributes=True
    )