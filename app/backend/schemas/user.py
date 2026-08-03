from enum import Enum

from pydantic import (
    BaseModel,
    ConfigDict,
    EmailStr
)


# ---------------------------------------------------------
# User Roles
# ---------------------------------------------------------

class UserRole(str, Enum):
    SYSTEM_ADMIN = "system_admin"
    INSTITUTION_ADMIN = "institution_admin"
    RESEARCHER = "researcher"


# ---------------------------------------------------------
# Base Schema
# ---------------------------------------------------------

class UserBase(BaseModel):
    username: str
    email: EmailStr
    role: UserRole = UserRole.RESEARCHER


# ---------------------------------------------------------
# Create Schema
# ---------------------------------------------------------

class UserCreate(UserBase):
    password: str


# ---------------------------------------------------------
# Login Schema
# ---------------------------------------------------------

class UserLogin(BaseModel):
    email: EmailStr
    password: str


# ---------------------------------------------------------
# Update Schema
# ---------------------------------------------------------

class UserUpdate(BaseModel):
    username: str | None = None
    email: EmailStr | None = None
    password: str | None = None
    role: UserRole | None = None


# ---------------------------------------------------------
# Response Schema
# ---------------------------------------------------------

class UserResponse(UserBase):
    id: int

    model_config = ConfigDict(
        from_attributes=True
    )