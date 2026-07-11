from pydantic import BaseModel, ConfigDict, EmailStr

# --------------------------------------
# Public Registration Schema
# --------------------------------------

class UserRegister(BaseModel):
    username: str
    email: EmailStr
    password: str

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    role: str

class UserResponse(BaseModel):
    id: int
    username: str
    email: EmailStr
    role: str
    is_active: bool

    model_config = ConfigDict(from_attributes=True)