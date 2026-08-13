from pydantic import BaseModel, EmailStr

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    role: str
    captcha_token: str | None = None
    # Cloudflare Turnstile token from the register page. Optional at the
    # schema level so the field never causes a validation-layer 422 before
    # our own CAPTCHA check can return a clear "CAPTCHA verification
    # failed" message instead (see routers/user.py::register).

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    role: str

    class Config:
        from_attributes = True

class UserLogin(BaseModel):
    email: EmailStr
    password: str
    captcha_token: str | None = None
    # Cloudflare Turnstile token from the login page. Optional at the
    # schema level so the field never causes a validation-layer 422 before
    # our own CAPTCHA check can return a clear "CAPTCHA verification
    # failed" message instead (see routers/user.py::login).


class UserUpdate(BaseModel):
    username: str
    email: EmailStr
