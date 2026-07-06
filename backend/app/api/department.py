from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.department import (
    DepartmentCreate,
    DepartmentResponse,
)
from app.services.department_service import (
    create_department,
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