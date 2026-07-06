from sqlalchemy.orm import Session

from app.models.department import Department
from app.schemas.department import DepartmentCreate


def create_department(
    db: Session,
    department: DepartmentCreate,
):
    db_department = Department(
        institution_id=department.institution_id,
        department_name=department.department_name,
        description=department.description,
    )

    db.add(db_department)
    db.commit()
    db.refresh(db_department)

    return db_department