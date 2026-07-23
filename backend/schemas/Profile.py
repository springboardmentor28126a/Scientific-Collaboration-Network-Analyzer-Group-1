from pydantic import BaseModel, EmailStr


class ProfileCreate(BaseModel):

    phone: str | None = None

    department: str | None = None

    institution: str | None = None

    aishe_code: str | None = None
    state: str | None = None
    district: str | None = None
    pincode: str | None = None
    institution_type: str | None = None
    country: str | None = None

    designation: str | None = None

    research_interest: str | None = None
    research_interests: str | None = None

    skills: str | None = None

    bio: str | None = None

    linkedin: str | None = None

    orcid: str | None = None

    google_scholar: str | None = None


class ProfileResponse(ProfileCreate):

    id: int

    user_id: int

    name: str | None = None
    email: EmailStr | None = None
    role: str | None = None

    class Config:

        from_attributes = True


class RegisterRequest(BaseModel):

    # User Table

    name: str

    email: EmailStr

    password: str

    role: str

    # Profile Table

    phone: str | None = None

    department: str | None = None

    institution: str | None = None

    designation: str | None = None

    research_interest: str | None = None

    skills: str | None = None

    bio: str | None = None

    country: str | None = None

    linkedin: str | None = None

    orcid: str | None = None

    google_scholar: str | None = None

