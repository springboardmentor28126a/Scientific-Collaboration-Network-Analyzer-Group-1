from pydantic import BaseModel
from typing import Optional
<<<<<<< HEAD

=======
>>>>>>> origin/P-Lakshmi-Sravani

class LoginRequest(BaseModel):
    username: str
    password: str
    captcha_token: str
<<<<<<< HEAD

=======
>>>>>>> origin/P-Lakshmi-Sravani

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user_id: int
    username: str
    role: str
    status: str
    must_reset_password: bool
    institution_id: Optional[int] = None

<<<<<<< HEAD

=======
>>>>>>> origin/P-Lakshmi-Sravani
class MfaRequiredResponse(BaseModel):
    mfa_required: bool = True
    user_id: int
    message: str = "A verification code has been sent to your email."


class OtpVerifyRequest(BaseModel):
    user_id: int
    otp_code: str