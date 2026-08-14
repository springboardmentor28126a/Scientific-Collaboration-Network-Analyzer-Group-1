from pydantic import BaseModel, EmailStr, Field


class CaptchaRequest(BaseModel):
    captcha_token: str | None = None
    captcha_id: str | None = None
    captcha_answer: str | None = None
    captcha_verification: str | None = None


class CaptchaVerifyRequest(BaseModel):
    captcha_id: str
    captcha_answer: str


class OTPRequest(CaptchaRequest):
    email: EmailStr


class OTPVerify(OTPRequest):
    code: str = Field(min_length=6, max_length=6, pattern=r"^\d{6}$")


class MFACode(BaseModel):
    code: str = Field(min_length=6, max_length=6, pattern=r"^\d{6}$")


class AIChatRequest(BaseModel):
    question: str = Field(min_length=3, max_length=4000)
