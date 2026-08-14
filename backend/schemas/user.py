from pydantic import BaseModel, EmailStr, Field


class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str
    institution_id: int | None = None
    department: str | None = None

designation: str | None = None

research_interests: str | None = None

orcid: str | None = None

google_scholar: str | None = None

linkedin: str | None = None
verification_status: str

is_verified: bool

class UserLogin(BaseModel):
    email: EmailStr
    password: str
    captcha_token: str | None = None
    captcha_id: str | None = None
    captcha_answer: str | None = None
    captcha_verification: str | None = None


# class UserUpdate(BaseModel):
#     name: str | None = None
#     email: EmailStr | None = None
#     password: str | None = None
#     role: str | None = None

class UserResponse(BaseModel):

    id: int
    name: str
    email: EmailStr
    role: str

    institution_id: int | None = None

    institution: str | None = None
    aishe_code: str | None = None
    state: str | None = None
    district: str | None = None
    pincode: str | None = None
    institution_type: str | None = None

    phone: str | int | None = None
    department: str | None = None
    country: str | None = None
    designation: str | None = None

    research_interests: str | None = None

    linkedin: str | None = None
    orcid: str | None = None
    google_scholar: str | None = None

    class Config:
        from_attributes = True

class UserUpdate(BaseModel):

    name: str | None = None
    email: EmailStr | None = None
    password: str | None = None
    role: str | None = None

    institution: str | None = None
    aishe_code: str | None = None
    state: str | None = None
    district: str | None = None
    pincode: str | None = None
    institution_type: str | None = None

    phone: str | int | None = None
    department: str | None = None
    country: str | None = None

    designation: str | None = None

    research_interests: str | None = None

    linkedin: str | None = None
    orcid: str | None = None
    google_scholar: str | None = None

    
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

    name: str = Field(..., min_length=3)

    email: EmailStr

    password: str = Field(..., min_length=8)
    confirm_password: str = Field(..., min_length=8)
    captcha_token: str | None = None
    captcha_id: str | None = None
    captcha_answer: str | None = None
    captcha_verification: str | None = None

    role: str

    # Profile Table

    phone: str | None = None

    department: str | None = None

    institution: str | None = None

    designation: str | None = None

    research_interest: str | None = None

    skills: str | None = None

    bio: str | None = None

    country: str = Field(default="India", min_length=1)

    linkedin: str | None = None

    orcid: str | None = None

    google_scholar: str | None = None
