import re

from fastapi import HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.sql import func

from app.models.user import User
from app.models.researcher import Researcher
from app.schemas.user import (
    UserCreate,
    UserRegister,
    InstitutionAdminCreate,
    ReviewerCreate,
)
from app.core.security import hash_password, verify_password
from app.utils.constants import UserRole, UserStatus


def validate_password(password: str):
    if len(password) < 8:
        return False
    if not re.search(r"[A-Z]", password):
        return False
    if not re.search(r"[a-z]", password):
        return False
    if not re.search(r"\d", password):
        return False
    if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", password):
        return False
    return True


def _check_unique(db: Session, username: str, email: str):
    if db.query(User).filter(User.username == username).first():
        raise HTTPException(status_code=400, detail="Username already exists.")
    if db.query(User).filter(User.email == email).first():
        raise HTTPException(status_code=400, detail="Email already exists.")


def _check_password_or_raise(password: str):
    if not validate_password(password):
        raise HTTPException(
            status_code=400,
            detail=(
                "Password must contain at least 8 characters, one uppercase, "
                "one lowercase, one number and one special character."
            ),
        )


def register_researcher(db: Session, user: UserRegister):
    _check_unique(db, user.username, user.email)
    _check_password_or_raise(user.password)

    db_user = User(
        username=user.username,
        email=user.email,
        password_hash=hash_password(user.password),
        role=UserRole.RESEARCHER.value,
        status=UserStatus.PENDING,
        is_active=True,
        institution_id=user.institution_id,
    )
    db.add(db_user)
    db.flush()

    db_researcher = Researcher(
        user_id=db_user.id,
        institution_id=user.institution_id,
        department_id=user.department_id,
        first_name=user.first_name,
        last_name=user.last_name,
    )
    db.add(db_researcher)
    db.commit()
    db.refresh(db_user)
    return db_user


def create_institution_admin(db: Session, payload: InstitutionAdminCreate, created_by_id: int):
    _check_unique(db, payload.username, payload.email)
    _check_password_or_raise(payload.password)

    db_user = User(
        username=payload.username,
        email=payload.email,
        password_hash=hash_password(payload.password),
        role=UserRole.INSTITUTION_ADMIN.value,
        status=UserStatus.APPROVED,
        is_active=True,
        institution_id=payload.institution_id,
        must_reset_password=True,
        created_by=created_by_id,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def create_reviewer(db: Session, payload: ReviewerCreate, created_by_id: int):
    _check_unique(db, payload.username, payload.email)
    _check_password_or_raise(payload.password)

    db_user = User(
        username=payload.username,
        email=payload.email,
        password_hash=hash_password(payload.password),
        role=UserRole.REVIEWER.value,
        status=UserStatus.APPROVED,
        is_active=True,
        institution_id=payload.institution_id,
        must_reset_password=True,
        created_by=created_by_id,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def create_user(db: Session, user: UserCreate):
    _check_unique(db, user.username, user.email)
    _check_password_or_raise(user.password)

    db_user = User(
        username=user.username,
        email=user.email,
        password_hash=hash_password(user.password),
        role=user.role.value if hasattr(user.role, "value") else user.role,
        status=UserStatus.APPROVED,
        is_active=True,
        institution_id=user.institution_id,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def list_all_users(db: Session):
    return (
        db.query(User)
        .filter(User.status != UserStatus.PENDING)
        .order_by(User.created_at.desc())
        .all()
    )

def list_pending_researchers(db: Session, institution_id: int):

    rows = (
        db.query(User, Researcher)
        .join(Researcher, Researcher.user_id == User.id)
        .filter(
            User.institution_id == institution_id,
            User.role == UserRole.RESEARCHER.value,
            User.status == UserStatus.PENDING,
        )
        .order_by(User.created_at.desc())
        .all()
    )

    results = []
    for user, researcher in rows:
        results.append(
            {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "role": user.role,
                "status": user.status,
                "created_at": user.created_at,
                "first_name": researcher.first_name,
                "last_name": researcher.last_name,
            }
        )

    return results


def approve_user(db: Session, user_id: int, approver_id: int, approver_institution_id: int):
    db_user = db.query(User).filter(User.id == user_id).first()
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found.")
    if db_user.institution_id != approver_institution_id:
        raise HTTPException(status_code=403, detail="You can only approve users from your own institution.")
    if db_user.status != UserStatus.PENDING:
        raise HTTPException(status_code=400, detail="User is not pending approval.")

    db_user.status = UserStatus.APPROVED
    db_user.approved_by = approver_id
    db_user.approved_at = func.now()
    db.commit()
    db.refresh(db_user)
    return db_user


def reject_user(db: Session, user_id: int, approver_institution_id: int):
    db_user = db.query(User).filter(User.id == user_id).first()
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found.")
    if db_user.institution_id != approver_institution_id:
        raise HTTPException(status_code=403, detail="You can only reject users from your own institution.")
    if db_user.status != UserStatus.PENDING:
        raise HTTPException(status_code=400, detail="User is not pending approval.")

    db_user.status = UserStatus.REJECTED
    db.commit()
    db.refresh(db_user)
    return db_user


def change_password(db: Session, user_id: int, old_password: str, new_password: str):
    db_user = db.query(User).filter(User.id == user_id).first()
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found.")
    if not verify_password(old_password, db_user.password_hash):
        raise HTTPException(status_code=400, detail="Old password is incorrect.")

    _check_password_or_raise(new_password)
    db_user.password_hash = hash_password(new_password)
    db_user.must_reset_password = False
    db.commit()
    db.refresh(db_user)
    return db_user