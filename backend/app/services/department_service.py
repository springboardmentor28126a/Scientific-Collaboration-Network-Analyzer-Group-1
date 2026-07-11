from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.department import Department
from app.schemas.department import DepartmentCreate
from app.schemas.department import DepartmentUpdate

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
def get_all_departments(db: Session):
    return db.query(Department).all()
def get_department(
    db: Session,
    department_id: int,
):
    department = (
        db.query(Department)
        .filter(Department.id == department_id)
        .first()
    )

    if department is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Department not found",
        )

    return department


def update_department(
    db: Session,
    department_id: int,
    department_data: DepartmentUpdate
):
    department = get_department(
        db,
        department_id,
    )

    department.institution_id = department_data.institution_id
    department.department_name = department_data.department_name
    department.description = department_data.description

    db.commit()
    db.refresh(department)

    return department


def delete_department(
    db: Session,
    department_id: int,
):
    department = get_department(
        db,
        department_id,
    )

    db.delete(department)
    db.commit()

    return {
        "message": "Department deleted successfully"
    }