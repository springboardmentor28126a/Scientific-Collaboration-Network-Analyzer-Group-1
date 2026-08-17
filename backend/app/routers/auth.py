from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import secrets
from app.models.researcher import Researcher
from app.database import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserLogin, UserResponse
from app.schemas.token import Token
from app.auth.hash import hash_password, verify_password
from app.auth.jwt_handler import create_access_token
from app.auth.dependencies import get_current_user
from app.services.email_service import send_verification_email
from app.schemas.audit import AuditLogCreate
from app.services.audit_service import create_audit_log
from app.models.researcher import Researcher


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


# =========================
# REGISTER
# =========================

@router.post("/register")
def register(
    user: UserCreate,
    db: Session = Depends(get_db)
):
    existing_user = db.query(User).filter(
        User.email == user.email
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    # Generate verification token
    verification_token = secrets.token_urlsafe(32)

    # Token valid for 24 hours
    verification_expiry = datetime.utcnow() + timedelta(hours=24)

    new_user = User(
        full_name=user.full_name,
        email=user.email,
        password=hash_password(user.password),
        role=user.role,
        email_verified=False,
        verification_token=verification_token,
        verification_token_expiry=verification_expiry
    )

    db.add(new_user)

    # Create researcher profile automatically
    if user.role == "researcher":

        existing_researcher = db.query(Researcher).filter(
            Researcher.email == user.email
        ).first()

        if not existing_researcher:
            new_researcher = Researcher(
                name=user.full_name,
                email=user.email,
                university="Not Provided",
                department="Not Provided"
            )

            db.add(new_researcher)

    db.commit()
    db.refresh(new_user)

    # Verification link
    verification_link = (
        f"http://127.0.0.1:8000/auth/verify-email"
        f"?token={verification_token}"
    )

    # Send verification email
    try:
        send_verification_email(
            user.email,
            verification_link
        )

    except Exception as e:
        db.delete(new_user)

        if user.role == "researcher":
            researcher = db.query(Researcher).filter(
                Researcher.email == user.email
            ).first()

            if researcher:
                db.delete(researcher)

        db.commit()

        raise HTTPException(
            status_code=500,
            detail=f"Could not send verification email: {str(e)}"
        )

    return {
        "message": "Registration successful. Please check your email and verify your account."
    }

# =========================
# LOGIN
# =========================

@router.post("/login", response_model=Token)
def login(
    user: UserLogin,
    db: Session = Depends(get_db)
):
    db_user = db.query(User).filter(
        User.email == user.email
    ).first()

    if not db_user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    if not verify_password(
        user.password,
        db_user.password
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    if db_user.role != user.role:
       raise HTTPException(
        status_code=403,
        detail="Incorrect role selected"
    )

    # Email verification check
    if not db_user.email_verified:
        raise HTTPException(
            status_code=403,
            detail="Please verify your email before logging in"
        )

    access_token = create_access_token(
    {
        "sub": db_user.email,
        "role": db_user.role
    }
)
    create_audit_log(
    db,
    AuditLogCreate(
        user_id=db_user.id,
        action="EMAIL_VERIFIED",
        module="Security",
        description="User email verified successfully",
        entity_type="User",
        entity_id=db_user.id
    )
)

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }


# =========================
# VERIFY EMAIL
# =========================

@router.get("/verify-email")
def verify_email(
    token: str,
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(
        User.verification_token == token
    ).first()

    # Token invalid ya already used
    if not user:
        raise HTTPException(
            status_code=400,
            detail="Invalid or already used verification link"
        )

    # Already verified
    if user.email_verified:
        return RedirectResponse(
            url="http://localhost:5173/",
            status_code=303
        )

    # Expiry missing
    if not user.verification_token_expiry:
        raise HTTPException(
            status_code=400,
            detail="Invalid verification token"
        )

    # Token expired
    if user.verification_token_expiry < datetime.utcnow():
        raise HTTPException(
            status_code=400,
            detail="Verification link has expired"
        )

    # Verify email
    user.email_verified = True

    # Token ko invalidate karo
    user.verification_token = None
    user.verification_token_expiry = None

    db.commit()

    # Frontend login page par redirect
    return RedirectResponse(
        url="http://localhost:5173/",
        status_code=303
    )

# =========================
# PROFILE
# =========================

@router.get("/profile", response_model=UserResponse)
def profile(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(
        User.email == current_user["sub"]
    ).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )
    create_audit_log(
    db,
    AuditLogCreate(
        user_id=db_user.id,
        action="PROFILE_VIEWED",
        module="User",
        description="User profile viewed",
        entity_type="User",
        entity_id=db_user.id
    )
)
    return user