from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr

from app.utils.constants import UserRole, UserStatus


# --------------------------------------
# Public Researcher Registration
# --------------------------------------

class UserRegister(BaseModel):
    username: str
    email: EmailStr
    password: str
    institution_id: int
    department_id: int
    first_name: str
    last_name: str
    captcha_token: str


# --------------------------------------
# Admin-created accounts
# --------------------------------------

class InstitutionAdminCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    institution_id: int


class ReviewerCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    institution_id: int


class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    role: UserRole
    institution_id: Optional[int] = None


# --------------------------------------
# Responses
# --------------------------------------

class UserResponse(BaseModel):
    id: int
    username: str
    email: EmailStr
    role: str
    status: UserStatus
    is_active: bool
    institution_id: Optional[int] = None
    must_reset_password: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class PendingUserResponse(BaseModel):
    id: int
    username: str
    email: EmailStr
    role: str
    status: UserStatus
    created_at: datetime
    first_name: Optional[str] = None
    last_name: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class ChangePasswordRequest(BaseModel):
    old_password: str
    new_password: str