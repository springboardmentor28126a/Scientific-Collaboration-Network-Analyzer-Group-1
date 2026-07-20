from pydantic import BaseModel


class InstitutionCreate(BaseModel):

    name: str

    address: str

    city: str

    state: str

    country: str

    website: str

    email: str

    phone: str

    description: str

    aishe_code: str | None = None

    district: str | None = None

    pincode: str | None = None

    institution_type: str | None = None


class InstitutionUpdate(InstitutionCreate):

    pass


class InstitutionResponse(InstitutionCreate):

    id: int

    class Config:

        from_attributes = True