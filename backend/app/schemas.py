from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from .models import UserRole

class UserBase(BaseModel):
    email: EmailStr
    username: str
    full_name: str
    role: UserRole = UserRole.RESEARCHER

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class InstitutionBase(BaseModel):
    name: str
    description: Optional[str] = None
    country: str
    city: str
    website: Optional[str] = None

class InstitutionCreate(InstitutionBase):
    pass

class InstitutionResponse(InstitutionBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class ResearcherProfileBase(BaseModel):
    department: str
    designation: str
    bio: Optional[str] = None
    skills: str
    research_interests: str
    institution_id: Optional[int] = None

class ResearcherProfileCreate(ResearcherProfileBase):
    pass

class ResearcherProfileUpdate(BaseModel):
    department: Optional[str] = None
    designation: Optional[str] = None
    bio: Optional[str] = None
    skills: Optional[str] = None
    research_interests: Optional[str] = None
    h_index: Optional[int] = None
    institution_id: Optional[int] = None

class ResearcherProfileResponse(ResearcherProfileBase):
    id: int
    user_id: int
    h_index: int
    full_name: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse