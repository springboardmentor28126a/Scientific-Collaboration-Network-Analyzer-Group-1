from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.db.database import get_db
from app.schemas.user import (
    UserRegister,
    UserCreate,
    UserResponse,
    InstitutionAdminCreate,
    ReviewerCreate,
    PendingUserResponse,
)
from app.services.user_service import (
    register_researcher,
    create_user,
    create_institution_admin,
    create_reviewer,
    list_pending_researchers,
    approve_user,
    reject_user,
    list_all_users,
)
from app.core.dependencies import get_current_user, require_roles
from app.models.user import User
from app.utils.constants import UserRole

router = APIRouter(prefix="/users", tags=["Users"])


@router.post("/register", response_model=UserResponse)
def register_user(user: UserRegister, db: Session = Depends(get_db)):
    return register_researcher(db, user)


@router.post(
    "/institution-admin",
    response_model=UserResponse,
    dependencies=[Depends(require_roles(UserRole.SYSTEM_ADMIN.value))],
)
def add_institution_admin(
    payload: InstitutionAdminCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return create_institution_admin(db, payload, current_user.id)


@router.post(
    "/reviewer",
    response_model=UserResponse,
    dependencies=[
        Depends(require_roles(UserRole.SYSTEM_ADMIN.value, UserRole.INSTITUTION_ADMIN.value))
    ],
)
def add_reviewer(
    payload: ReviewerCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return create_reviewer(db, payload, current_user.id)


@router.get(
    "/pending",
    response_model=List[PendingUserResponse],
    dependencies=[Depends(require_roles(UserRole.INSTITUTION_ADMIN.value))],
)
def get_pending_researchers(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return list_pending_researchers(db, current_user.institution_id)


@router.patch(
    "/{user_id}/approve",
    response_model=UserResponse,
    dependencies=[Depends(require_roles(UserRole.INSTITUTION_ADMIN.value))],
)
def approve_researcher(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return approve_user(db, user_id, current_user.id, current_user.institution_id)


@router.patch(
    "/{user_id}/reject",
    response_model=UserResponse,
    dependencies=[Depends(require_roles(UserRole.INSTITUTION_ADMIN.value))],
)
def reject_researcher(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return reject_user(db, user_id, current_user.institution_id)


@router.post(
    "/",
    response_model=UserResponse,
    dependencies=[Depends(require_roles(UserRole.SYSTEM_ADMIN.value))],
)
def admin_create_user(user: UserCreate, db: Session = Depends(get_db)):
    return create_user(db, user)

@router.get(
    "/",
    response_model=List[UserResponse],
    dependencies=[Depends(require_roles(UserRole.SYSTEM_ADMIN.value))],
)
def get_all_users(db: Session = Depends(get_db)):
    return list_all_users(db)