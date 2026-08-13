from fastapi import APIRouter, BackgroundTasks, Depends
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
from app.services.email_service import send_email
from app.core.dependencies import get_current_user, require_roles
from app.models.user import User
from app.utils.constants import UserRole


router = APIRouter(prefix="/users", tags=["Users"])


@router.post("/register", response_model=UserResponse)
def register_user(
    user: UserRegister,
    db: Session = Depends(get_db),
):
    return register_researcher(db, user)


@router.post(
    "/institution-admin",
    response_model=UserResponse,
    dependencies=[Depends(require_roles(UserRole.SYSTEM_ADMIN.value))],
)
def add_institution_admin(
    payload: InstitutionAdminCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    new_user = create_institution_admin(
        db,
        payload,
        current_user.id,
    )

    background_tasks.add_task(
        send_email,
        payload.email,
        "Your Scientific Collaboration Network Analyzer Account",
        (
            f"Hello,\n\n"
            f"Your Institution Admin account has been created.\n\n"
            f"Username: {payload.username}\n"
            f"Temporary Password: {payload.password}\n\n"
            f"Please log in using these credentials. "
            f"You will be required to change your temporary password "
            f"after your first login.\n\n"
            f"Please do not share these credentials with anyone.\n\n"
            f"Regards,\n"
            f"Scientific Collaboration Network Analyzer"
        ),
    )

    return new_user


@router.post(
    "/reviewer",
    response_model=UserResponse,
    dependencies=[
        Depends(
            require_roles(
                UserRole.SYSTEM_ADMIN.value,
                UserRole.INSTITUTION_ADMIN.value,
            )
        )
    ],
)
def add_reviewer(
    payload: ReviewerCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    new_user = create_reviewer(
        db,
        payload,
        current_user.id,
    )

    background_tasks.add_task(
        send_email,
        payload.email,
        "Your Reviewer Account - Scientific Collaboration Network Analyzer",
        (
            f"Hello,\n\n"
            f"Your Reviewer account has been created.\n\n"
            f"Username: {payload.username}\n"
            f"Temporary Password: {payload.password}\n\n"
            f"Please log in using these credentials. "
            f"You will be required to change your temporary password "
            f"after your first login.\n\n"
            f"Please do not share these credentials with anyone.\n\n"
            f"Regards,\n"
            f"Scientific Collaboration Network Analyzer"
        ),
    )

    return new_user


@router.get(
    "/pending",
    response_model=List[PendingUserResponse],
    dependencies=[Depends(require_roles(UserRole.INSTITUTION_ADMIN.value))],
)
def get_pending_researchers(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return list_pending_researchers(
        db,
        current_user.institution_id,
    )


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
    return approve_user(
        db,
        user_id,
        current_user.id,
        current_user.institution_id,
    )


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
    return reject_user(
        db,
        user_id,
        current_user.institution_id,
    )


@router.post(
    "/",
    response_model=UserResponse,
    dependencies=[Depends(require_roles(UserRole.SYSTEM_ADMIN.value))],
)
def admin_create_user(
    user: UserCreate,
    db: Session = Depends(get_db),
):
    return create_user(db, user)


@router.get(
    "/",
    response_model=List[UserResponse],
    dependencies=[Depends(require_roles(UserRole.SYSTEM_ADMIN.value))],
)
def get_all_users(
    db: Session = Depends(get_db),
):
    return list_all_users(db)