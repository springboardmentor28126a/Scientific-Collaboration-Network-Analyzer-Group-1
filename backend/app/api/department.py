from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.department import DepartmentCreate, DepartmentUpdate, DepartmentResponse, DepartmentPublicResponse
from app.services.department_service import (
    create_department,
    get_all_departments,
    get_department,
    update_department,
    delete_department,
    get_departments_by_institution_public,
)
from app.core.dependencies import get_current_user, require_roles
from app.models.user import User
from app.utils.constants import UserRole

router = APIRouter(prefix="/departments", tags=["Departments"])


@router.get(
    "/public",
    response_model=list[DepartmentPublicResponse],
)
def read_departments_public(
    institution_id: int,
    db: Session = Depends(get_db),
):
    return get_departments_by_institution_public(db, institution_id)


@router.post(
    "",
    response_model=DepartmentResponse,
    dependencies=[Depends(require_roles(UserRole.SYSTEM_ADMIN.value, UserRole.INSTITUTION_ADMIN.value))],
)
def add_department(
    department: DepartmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return create_department(db, department, current_user)


@router.get(
    "",
    response_model=list[DepartmentResponse],
    dependencies=[Depends(require_roles(UserRole.SYSTEM_ADMIN.value, UserRole.INSTITUTION_ADMIN.value))],
)
def read_all_departments(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_all_departments(db, current_user)


@router.get(
    "/{department_id}",
    response_model=DepartmentResponse,
    dependencies=[Depends(require_roles(UserRole.SYSTEM_ADMIN.value, UserRole.INSTITUTION_ADMIN.value))],
)
def read_department(
    department_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_department(db, department_id, current_user)


@router.put(
    "/{department_id}",
    response_model=DepartmentResponse,
    dependencies=[Depends(require_roles(UserRole.SYSTEM_ADMIN.value, UserRole.INSTITUTION_ADMIN.value))],
)
def edit_department(
    department_id: int,
    department: DepartmentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return update_department(db, department_id, department, current_user)


@router.delete(
    "/{department_id}",
    dependencies=[Depends(require_roles(UserRole.SYSTEM_ADMIN.value, UserRole.INSTITUTION_ADMIN.value))],
)
def remove_department(
    department_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return delete_department(db, department_id, current_user)