from pydantic import BaseModel, EmailStr


class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserUpdate(BaseModel):
    name: str | None = None
    email: EmailStr | None = None
    password: str | None = None
    role: str | None = None


class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: str

    class Config:
        from_attributes = True

class ProfileCreate(BaseModel):

    phone: str | None = None

    department: str | None = None

    institution: str | None = None

    designation: str | None = None

    research_interest: str | None = None

    skills: str | None = None

    bio: str | None = None

    linkedin: str | None = None

    orcid: str | None = None

    google_scholar: str | None = None


class ProfileResponse(ProfileCreate):

    id: int

    user_id: int

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