from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.department import (
    DepartmentCreate,
    DepartmentUpdate,
    DepartmentResponse,
)
from app.services.department_service import (
    create_department,
    get_all_departments,
    get_department,
    update_department,
    delete_department,
)

router = APIRouter(
    prefix="/departments",
    tags=["Departments"],
)


@router.post(
    "",
    response_model=DepartmentResponse,
)
def add_department(
    department: DepartmentCreate,
    db: Session = Depends(get_db),
):
    return create_department(
        db,
        department,
    )
@router.get(
    "",
    response_model=list[DepartmentResponse],
)
def read_all_departments(
    db: Session = Depends(get_db),
):
    return get_all_departments(db)
@router.get(
    "/{department_id}",
    response_model=DepartmentResponse,
)
def read_department(
    department_id: int,
    db: Session = Depends(get_db),
):
    return get_department(
        db,
        department_id,
    )


@router.put(
    "/{department_id}",
    response_model=DepartmentResponse,
)
def edit_department(
    department_id: int,
    department: DepartmentUpdate,
    db: Session = Depends(get_db),
):
    return update_department(
        db,
        department_id,
        department,
    )


@router.delete(
    "/{department_id}",
)
def remove_department(
    department_id: int,
    db: Session = Depends(get_db),
):
    return delete_department(
        db,
        department_id,
    )