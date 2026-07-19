from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.department import Department
from app.models.user import User
from app.schemas.department import DepartmentCreate, DepartmentUpdate
from app.utils.constants import UserRole


def _check_institution_access(department_institution_id: int, current_user: User):
    if current_user.role == UserRole.INSTITUTION_ADMIN.value:
        if department_institution_id != current_user.institution_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only manage departments for your own institution.",
            )


def create_department(db: Session, department: DepartmentCreate, current_user: User):
    _check_institution_access(department.institution_id, current_user)

    db_department = Department(
        institution_id=department.institution_id,
        department_name=department.department_name,
        description=department.description,
    )

    db.add(db_department)
    db.commit()
    db.refresh(db_department)
    return db_department


def get_all_departments(db: Session, current_user: User):
    query = db.query(Department)

    if current_user.role == UserRole.INSTITUTION_ADMIN.value:
        query = query.filter(Department.institution_id == current_user.institution_id)

    return query.all()


def get_department(db: Session, department_id: int, current_user: User):
    department = db.query(Department).filter(Department.id == department_id).first()

    if department is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Department not found")

    _check_institution_access(department.institution_id, current_user)

    return department


def update_department(db: Session, department_id: int, department_data: DepartmentUpdate, current_user: User):
    department = get_department(db, department_id, current_user)

    # Prevent an Institution Admin from moving a department to a different institution
    if current_user.role == UserRole.INSTITUTION_ADMIN.value:
        if department_data.institution_id != current_user.institution_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You cannot move a department to a different institution.",
            )

    department.institution_id = department_data.institution_id
    department.department_name = department_data.department_name
    department.description = department_data.description

    db.commit()
    db.refresh(department)
    return department


def delete_department(db: Session, department_id: int, current_user: User):
    department = get_department(db, department_id, current_user)

    db.delete(department)
    db.commit()
    return {"message": "Department deleted successfully"}
def get_departments_by_institution_public(db: Session, institution_id: int):
    return (
        db.query(Department)
        .filter(Department.institution_id == institution_id)
        .all()
    )