from fastapi import HTTPException

from sqlalchemy.orm import Session

from app.models.user import User
from app.schemas.user import (
    UserCreate,
    UserRegister,
)

from app.core.security import hash_password

import re


# --------------------------------------
# Password Validation
# --------------------------------------

def validate_password(password: str):

    if len(password) < 8:
        return False

    if not re.search(r"[A-Z]", password):
        return False

    if not re.search(r"[a-z]", password):
        return False

    if not re.search(r"\d", password):
        return False

    if not re.search(
        r"[!@#$%^&*(),.?\":{}|<>]",
        password,
    ):
        return False

    return True


# --------------------------------------
# System Admin User Creation
# --------------------------------------

def create_user(
    db: Session,
    user: UserCreate,
):

    existing_username = (
        db.query(User)
        .filter(User.username == user.username)
        .first()
    )

    if existing_username:

        raise HTTPException(
            status_code=400,
            detail="Username already exists.",
        )

    existing_email = (
        db.query(User)
        .filter(User.email == user.email)
        .first()
    )

    if existing_email:

        raise HTTPException(
            status_code=400,
            detail="Email already exists.",
        )

    if not validate_password(user.password):

        raise HTTPException(
            status_code=400,
            detail=(
                "Password must contain at least "
                "8 characters, one uppercase, "
                "one lowercase, one number "
                "and one special character."
            ),
        )

    db_user = User(

        username=user.username,

        email=user.email,

        password_hash=hash_password(user.password),

        role=user.role,

        is_active=True,

    )

    db.add(db_user)

    db.commit()

    db.refresh(db_user)

    return db_user


# --------------------------------------
# Public Researcher Registration
# --------------------------------------

def register_researcher(
    db: Session,
    user: UserRegister,
):

    existing_username = (
        db.query(User)
        .filter(User.username == user.username)
        .first()
    )

    if existing_username:

        raise HTTPException(
            status_code=400,
            detail="Username already exists.",
        )

    existing_email = (
        db.query(User)
        .filter(User.email == user.email)
        .first()
    )

    if existing_email:

        raise HTTPException(
            status_code=400,
            detail="Email already exists.",
        )

    if not validate_password(user.password):

        raise HTTPException(
            status_code=400,
            detail=(
                "Password must contain at least "
                "8 characters, one uppercase, "
                "one lowercase, one number "
                "and one special character."
            ),
        )

    db_user = User(

        username=user.username,

        email=user.email,

        password_hash=hash_password(user.password),

        role="RESEARCHER",

        is_active=True,

    )

    db.add(db_user)

    db.commit()

    db.refresh(db_user)

    return db_user