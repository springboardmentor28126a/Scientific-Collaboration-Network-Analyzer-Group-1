
import hashlib
import logging
import os
import re
import secrets
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from backend.utils.security import create_access_token, get_current_user
from backend.utils.passwords import hash_password, verify_password
from backend.database.database import get_db
from backend.database.models import User, EmailOTP, AuthRateLimit, Notification
from backend.models.verification_document import VerificationDocument
from backend.schemas.user import RegisterRequest, UserLogin, UserUpdate, UserResponse
from backend.schemas.security import OTPRequest, OTPVerify, MFACode, CaptchaVerifyRequest
from backend.services.captcha_service import consume_captcha_verification, issue_alphanumeric_captcha, verify_captcha_answer, create_captcha_verification
from backend.services.email_service import send_otp_email, send_security_notice, email_configured
from backend.services.mfa_service import generate_secret, generate_recovery_codes, verify_totp
router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)
logger = logging.getLogger(__name__)

VALID_ROLES = {
    "Researcher",
    "Reviewer",
    "Institution Admin",
    "System Admin",
}

GENERIC_LOGIN_ERROR = "Unable to authenticate with those credentials."


def _captcha_or_reject(token: str | None, captcha_id: str | None, captcha_answer: str | None, request: Request, db: Session, captcha_verification: str | None = None) -> None:
    if os.getenv("CAPTCHA_REQUIRED", "true").lower() != "true":
        return
    valid = consume_captcha_verification(db, captcha_verification)
    if not valid:
        valid = verify_captcha_answer(db, captcha_id, captcha_answer, consume=True)
    if not valid:
        raise HTTPException(status_code=400, detail="CAPTCHA verification failed.")


def _rate_limit(db: Session, key: str, limit: int, seconds: int) -> None:
    now = datetime.now(timezone.utc)
    record = db.query(AuthRateLimit).filter(AuthRateLimit.key == key).first()
    if not record or (now - record.window_started_at.replace(tzinfo=timezone.utc)).total_seconds() >= seconds:
        if record:
            record.window_started_at, record.attempts = now, 1
        else:
            db.add(AuthRateLimit(key=key, window_started_at=now, attempts=1))
        db.commit()
        return
    if record.attempts >= limit:
        raise HTTPException(status_code=429, detail="Too many attempts. Please try again later.")
    record.attempts += 1
    db.commit()


def _password_error(password: str) -> str | None:
    if len(password) < 8:
        return "Password must be at least 8 characters."
    return None

@router.post("/register")
def register(
    user: RegisterRequest,
    request: Request,
    db: Session = Depends(get_db)
):

    _captcha_or_reject(user.captcha_token, user.captcha_id, user.captcha_answer, request, db, user.captcha_verification)
    password_error = _password_error(user.password)
    if password_error:
        raise HTTPException(status_code=422, detail=password_error)
    if user.confirm_password is not None and user.password != user.confirm_password:
        raise HTTPException(status_code=422, detail="Passwords do not match.")

    existing_user = db.query(User).filter(
        User.email == user.email
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="⚠ This email is already registered."
        )

    if user.role not in VALID_ROLES:
        raise HTTPException(status_code=400, detail="Invalid role.")

    if user.role == "System Admin" and db.query(User).filter(
        User.role == "System Admin"
    ).first():
        raise HTTPException(
            status_code=409,
            detail="System Administrator already exists. Only the current System Administrator can transfer ownership.",
        )

    hashed_password = hash_password(user.password)

    # --------------------------
    # Create User
    # --------------------------

    new_user = User(

        name=user.name,

        email=user.email,

        password=hashed_password,

        role=user.role,

        phone=user.phone or "",

        department=user.department or "",

        institution_name=user.institution or "",

        designation=user.designation or "",

        research_interests=user.research_interest or "",

        skills=user.skills or "",

        bio=user.bio or "",

        country=user.country or "",

        linkedin=user.linkedin or "",

        orcid=user.orcid or "",

        google_scholar=user.google_scholar or "",
        verification_status="Not Submitted",

        is_verified=False

    )

    db.add(new_user)

    db.commit()

    db.refresh(new_user)

    # Registration creates an actionable notification only for the existing
    # System Admin.  It is intentionally not broadcast to ordinary users.
    system_admin = db.query(User).filter(User.role == "System Admin").first()
    if system_admin and system_admin.id != new_user.id:
        db.add(Notification(
            user_id=system_admin.id,
            title="New user requires attention",
            message=f"{new_user.name} registered as {new_user.role} and may require verification.",
            notification_type="user_registered",
            resource_type="verification",
            resource_id=new_user.id,
        ))
        db.commit()

    return {

        "message": "Registration Successful",

        "user_id": new_user.id

    }


@router.post("/forgot-password")
def forgot_password(email: str):
    return {
        "message": "OTP Sent Successfully"
    }


@router.get("/email/status")
def email_status():
    return {"configured": email_configured()}




@router.get("/captcha")
def captcha(replace_id: str | None = None, db: Session = Depends(get_db)):
    try:
        return issue_alphanumeric_captcha(db, replace_id=replace_id)
    except Exception:
        logger.exception("CAPTCHA challenge endpoint failed")
        raise HTTPException(status_code=503, detail="CAPTCHA service is temporarily unavailable.")


@router.post("/captcha/verify")
def verify_captcha_challenge(payload: CaptchaVerifyRequest, db: Session = Depends(get_db)):
    if not verify_captcha_answer(db, payload.captcha_id, payload.captcha_answer):
        raise HTTPException(status_code=400, detail="CAPTCHA verification failed.")
    return {"captcha_verification": create_captcha_verification(payload.captcha_id), "expires_in": 300}


@router.get("/{user_id}", response_model=UserResponse)
def get_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # return user
    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role,
        "institution_id": user.institution_id,

        "institution": str(user.institution) if user.institution else None,
        "aishe_code": user.aishe_code,
        "state": user.state,
        "district": user.district,
        "pincode": user.pincode,
        "institution_type": user.institution_type,

        "department": user.department,
        "country": user.country,
        "designation": user.designation,
        "research_interests": user.research_interests,
        "orcid": user.orcid,
        "google_scholar": user.google_scholar,
        "linkedin": user.linkedin,

        # Convert Decimal to String
        "phone": str(user.phone) if user.phone is not None else None,
    }


@router.put("/{user_id}", response_model=UserResponse)
def update_user(
    user_id: int,
    user: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "System Admin" and current_user.id != user_id:
        raise HTTPException(status_code=403, detail="You can only update your own profile.")
    if user.role is not None and current_user.role != "System Admin":
        raise HTTPException(status_code=403, detail="Only System Admin can change roles.")
    existing_user = db.query(User).filter(User.id == user_id).first()

    if not existing_user:
        raise HTTPException(status_code=404, detail="User not found")

    if existing_user.role != "System Admin" and existing_user.account_status != "Active":
        raise HTTPException(
            status_code=403,
            detail="Your account is blocked or suspended. Contact a System Administrator.",
        )

    # -------- User Table --------

    if user.name is not None:
        existing_user.name = user.name

    if user.email is not None:
        existing_user.email = user.email

    password_changed = user.password is not None
    if password_changed:
        existing_user.password = hash_password(user.password)

    if user.role is not None:
        existing_user.role = user.role

    if user.institution is not None:
        existing_user.institution_name  = user.institution

    if user.aishe_code is not None:
        existing_user.aishe_code = user.aishe_code

    if user.state is not None:
        existing_user.state = user.state
    

    if user.district is not None:
        existing_user.district = user.district

    if user.pincode is not None:
        existing_user.pincode = user.pincode

    if user.institution_type is not None:
        existing_user.institution_type = user.institution_type

    if user.phone is not None:
        existing_user.phone = user.phone

    if user.department is not None:
        existing_user.department = user.department

    if user.country is not None:
        existing_user.country = user.country

    if user.designation is not None:
        existing_user.designation = user.designation

    if user.research_interests is not None:
        existing_user.research_interests = user.research_interests

    if user.linkedin is not None:
        existing_user.linkedin = user.linkedin

    if user.orcid is not None:
        existing_user.orcid = user.orcid

    if user.google_scholar is not None:
        existing_user.google_scholar = user.google_scholar
    







    db.commit()
    db.refresh(existing_user)
    if password_changed:
        send_security_notice(existing_user.email, "SCNA password changed", "Your SCNA password was changed. If you did not make this change, contact an administrator immediately.")

    return {
        "id": existing_user.id,
        "name": existing_user.name,
        "email": existing_user.email,
        "role": existing_user.role,
        "institution_id": existing_user.institution_id,

        "institution": existing_user.institution,
        "aishe_code": existing_user.aishe_code,
        "state": existing_user.state,
        "district": existing_user.district,
        "pincode": existing_user.pincode,
        "institution_type": existing_user.institution_type,

        "phone": str(existing_user.phone) if existing_user.phone else None,
        "department": existing_user.department,
        "country": existing_user.country,
        "designation": existing_user.designation,
        "research_interests": existing_user.research_interests,
        "linkedin": existing_user.linkedin,
        "orcid": existing_user.orcid,
        "google_scholar": existing_user.google_scholar,
    }



@router.delete("/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db)):
    # Kept as a legacy endpoint, but no longer allows anonymous deletion.
    raise HTTPException(status_code=405, detail="Use the protected admin user-management endpoint.")


# 👇 Paste the login API HERE

@router.post("/login")
def login(user: UserLogin, request: Request, db: Session = Depends(get_db)):

    _captcha_or_reject(user.captcha_token, user.captcha_id, user.captcha_answer, request, db, user.captcha_verification)
    _rate_limit(db, f"login:{request.client.host if request.client else 'unknown'}", 10, 300)

    existing_user = db.query(User).filter(User.email == user.email).first()

    if not existing_user:
        raise HTTPException(status_code=401, detail=GENERIC_LOGIN_ERROR)

    if not verify_password(user.password, existing_user.password):
        raise HTTPException(status_code=401, detail=GENERIC_LOGIN_ERROR)

    # The user-table default must not imply that a document was submitted.
    # The latest verification document is the source of truth for login state.
    latest_document = (
        db.query(VerificationDocument)
        .filter(VerificationDocument.user_id == existing_user.id)
        .order_by(VerificationDocument.id.desc())
        .first()
    )

    if existing_user.is_verified or (
        latest_document is not None and latest_document.status == "Approved"
    ):
        effective_verification_status = "Approved"
        effective_is_verified = True
    elif latest_document is not None:
        effective_verification_status = latest_document.status
        effective_is_verified = False
    else:
        effective_verification_status = "Not Submitted"
        effective_is_verified = False

    role = existing_user.role

    if role == "Researcher":
        message = "Welcome Researcher"

    elif role == "Institution Admin":
        message = "Welcome Institution Admin"

    elif role == "Reviewer":
        message = "Welcome Reviewer"

    elif role == "System Admin":
        message = "Welcome System Admin"

    else:
        message = "Unknown Role"

    access_token = create_access_token(
    {
        "sub": existing_user.email,
        "role": existing_user.role
    }
    )
    send_security_notice(existing_user.email, "SCNA sign-in notification", "A sign-in to your SCNA account was completed.")

    return {
    "access_token": access_token,
    "token_type": "bearer",
    "user": {
        "id": existing_user.id,
        "name": existing_user.name,
        "email": existing_user.email,
        "role": existing_user.role,
        "institution_id": existing_user.institution_id,
        "verification_status": effective_verification_status,
        "is_verified": effective_is_verified,
        "verified_at": existing_user.verified_at or (
            latest_document.verified_at if latest_document else None
        ),
    }
}


@router.post("/request-otp")
def request_otp(payload: OTPRequest, request: Request, db: Session = Depends(get_db)):
    _captcha_or_reject(payload.captcha_token, payload.captcha_id, payload.captcha_answer, request, db, payload.captcha_verification)
    _rate_limit(db, f"otp:{payload.email.lower()}:{request.client.host if request.client else 'unknown'}", 3, 900)
    now = datetime.now(timezone.utc)
    user = db.query(User).filter(User.email == payload.email).first()
    # Always return the same response to reduce account enumeration.
    if user:
        code = f"{secrets.randbelow(1000000):06d}"
        db.add(EmailOTP(email=payload.email.lower(), purpose="login", code_hash=hashlib.sha256(code.encode()).hexdigest(), expires_at=now + timedelta(minutes=5)))
        db.commit()
        if not send_otp_email(user.email, code):
            raise HTTPException(status_code=503, detail="Email delivery is temporarily unavailable.")
    return {"message": "If the account is eligible, a sign-in code has been sent."}


@router.post("/verify-otp")
def verify_otp(payload: OTPVerify, db: Session = Depends(get_db)):
    otp = db.query(EmailOTP).filter(EmailOTP.email == payload.email.lower(), EmailOTP.purpose == "login", EmailOTP.consumed_at.is_(None)).order_by(EmailOTP.created_at.desc()).first()
    if not otp or otp.expires_at.replace(tzinfo=timezone.utc) < datetime.now(timezone.utc) or otp.attempts >= 5:
        raise HTTPException(status_code=401, detail="Invalid or expired code.")
    if not secrets.compare_digest(otp.code_hash, hashlib.sha256(payload.code.encode()).hexdigest()):
        otp.attempts += 1
        db.commit()
        raise HTTPException(status_code=401, detail="Invalid or expired code.")
    user = db.query(User).filter(User.email == payload.email).first()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid or expired code.")
    otp.consumed_at = datetime.now(timezone.utc)
    db.commit()
    return {"access_token": create_access_token({"sub": user.email, "role": user.role}), "token_type": "bearer", "user": {"id": user.id, "name": user.name, "email": user.email, "role": user.role, "is_verified": user.is_verified, "verification_status": user.verification_status}}


@router.post("/mfa/setup")
def setup_mfa(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    secret = generate_secret()
    current_user.mfa_secret = secret
    current_user.mfa_enabled = False
    db.commit()
    return {"secret": secret, "otpauth_uri": f"otpauth://totp/SCNA:{current_user.email}?secret={secret}&issuer=SCNA"}


@router.post("/mfa/enable")
def enable_mfa(payload: MFACode, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not current_user.mfa_secret or not verify_totp(current_user.mfa_secret, payload.code):
        raise HTTPException(status_code=400, detail="Invalid MFA code.")
    codes = generate_recovery_codes()
    current_user.mfa_enabled = True
    current_user.mfa_recovery_codes = "\n".join(hashlib.sha256(code.encode()).hexdigest() for code in codes)
    db.commit()
    send_security_notice(current_user.email, "SCNA MFA enabled", "Multi-factor authentication was enabled for your SCNA account.")
    return {"message": "MFA enabled.", "recovery_codes": codes}


@router.post("/mfa/disable")
def disable_mfa(payload: MFACode, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not current_user.mfa_secret or not verify_totp(current_user.mfa_secret, payload.code):
        raise HTTPException(status_code=400, detail="Invalid MFA code.")
    current_user.mfa_enabled = False
    current_user.mfa_secret = None
    current_user.mfa_recovery_codes = None
    db.commit()
    send_security_notice(current_user.email, "SCNA MFA disabled", "Multi-factor authentication was disabled for your SCNA account.")
    return {"message": "MFA disabled."}
