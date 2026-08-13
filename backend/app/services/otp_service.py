import random
from datetime import datetime, timedelta, timezone

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.otp_code import OtpCode
from app.models.user import User
from app.services.email_service import send_email

OTP_EXPIRY_MINUTES = 5


async def generate_and_send_otp(db: Session, user: User):
    code = f"{random.randint(0, 999999):06d}"
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=OTP_EXPIRY_MINUTES)

    otp = OtpCode(user_id=user.id, code=code, expires_at=expires_at)
    db.add(otp)
    db.commit()

    try:
        await send_email(
            recipient=user.email,
            subject="Your SciConnect login code",
            body=f"Your verification code is {code}. It expires in {OTP_EXPIRY_MINUTES} minutes. If you didn't request this, you can ignore this email.",
        )
    except Exception as e:
        print("OTP email sending failed:", e)


def verify_otp(db: Session, user_id: int, code: str) -> bool:
    otp = (
        db.query(OtpCode)
        .filter(OtpCode.user_id == user_id, OtpCode.code == code, OtpCode.is_used == False)
        .order_by(OtpCode.created_at.desc())
        .first()
    )

    if otp is None:
        raise HTTPException(status_code=400, detail="Invalid verification code.")

    if otp.expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="Verification code has expired. Please log in again.")

    otp.is_used = True
    db.commit()
    return True