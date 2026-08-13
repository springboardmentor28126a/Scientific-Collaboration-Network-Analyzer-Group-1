from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import RedirectResponse
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
import secrets

from app.backend.database.database import SessionLocal
from app.backend.models.user import User
from app.backend.schemas.user import UserCreate, UserLogin
from app.backend.utils.security import (
    hash_password,
    verify_password,
    create_access_token,
    verify_access_token
)

from app.backend.routers.audit import log_audit_event
from app.backend.routers.notification import create_notification
from app.backend.utils.email import send_verification_email
import os
import requests
from dotenv import load_dotenv
load_dotenv()
router = APIRouter(
    prefix="/users",
    tags=["Users"]
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/users/login")


# Database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ---------------------------
# Register
# ---------------------------
@router.post("/register")
def register(user: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == user.email).first()

    if existing_user:
        log_audit_event(db, "Registration Failed", "User", f"Email already registered: {user.email}")
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    verification_token = secrets.token_urlsafe(32)

    new_user = User(
    username=user.username,
    email=user.email,
    password=hash_password(user.password),
    role=user.role,
    email_verified=False,
    verification_token=verification_token
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    send_verification_email(
    new_user.email,
    new_user.verification_token
    )

    log_audit_event(db, "User Registered", "User", f"New user registered: {new_user.email} with role {new_user.role}", new_user.id)
    create_notification(db, "New User Registered", f"User {new_user.username} ({new_user.role}) has joined the platform.", None, "user")

    return {
        "message": "User registered successfully",
        "id": new_user.id
    }

# ---------------------------
# Verify Email
# ---------------------------

@router.get("/verify-email")
def verify_email(token: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(
        User.verification_token == token
    ).first()

    if not user:
        raise HTTPException(
            status_code=400,
            detail="Invalid verification token"
        )

    if user.email_verified:
        return {
            "message": "Email is already verified."
        }

    user.email_verified = True
    user.verification_token = None

    db.commit()
    db.refresh(user)

    log_audit_event(
        db,
        "Email Verified",
        "User",
        f"Email verified successfully: {user.email}",
        user.id
    )

    return RedirectResponse(
    url="/email-verified",
    status_code=303
    )
# ---------------------------
# Login
# ---------------------------
@router.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):
    captcha_response = requests.post(
        "https://www.google.com/recaptcha/api/siteverify",
        data={
            "secret": os.getenv("RECAPTCHA_SECRET_KEY"),
            "response": user.captcha_token,
        },
    )

    captcha_result = captcha_response.json()

    if not captcha_result.get("success"):
        raise HTTPException(
            status_code=400,
            detail="CAPTCHA verification failed."
        )

    db_user = db.query(User).filter(
        User.email == user.email
    ).first()

    if not db_user:
        log_audit_event(db, "Login Failed", "Security", f"User not found: {user.email}")
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )
    if not db_user.email_verified:
        raise HTTPException(
        status_code=403,
        detail="Please verify your email before logging in."
    )
    if not verify_password(
        user.password,
        db_user.password
    ):
        
        log_audit_event(db, "Login Failed", "Security", f"Invalid password attempt for: {user.email}", db_user.id)
        raise HTTPException(
            status_code=401,
            detail="Invalid password"
        )

    access_token = create_access_token(
        data={
            "sub": db_user.email,
            "id": db_user.id,
            "role": db_user.role
        }
    )

    log_audit_event(db, "User Logged In", "User", f"Successful login for: {db_user.email}", db_user.id)

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "id": db_user.id,
        "username": db_user.username,
        "email": db_user.email,
        "role": db_user.role
    }


# ---------------------------
# Current Logged-in User
# ---------------------------
@router.get("/me")
def get_current_user(token: str = Depends(oauth2_scheme)):

    user = verify_access_token(token)

    if user is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token"
        )

    return {
        "message": "Token is valid",
        "id": user["id"],
        "email": user["email"],
        "role": user["role"]
    }