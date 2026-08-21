from sqlalchemy.orm import Session
from fastapi import HTTPException

from models.department import Department
from schemas.department import (
    DepartmentCreate,
    DepartmentUpdate
)


def create_department(
    db: Session,
    data: DepartmentCreate
) -> Department:

    new_department = Department(
        **data.model_dump()
    )

    db.add(new_department)

    db.commit()

    db.refresh(new_department)

    return new_department


def get_all_departments(
    db: Session
):

    return db.query(Department).all()


def get_department_by_id(
    db: Session,
    department_id: int
) -> Department:

    department = (
        db.query(Department)
        .filter(
            Department.id == department_id
        )
        .first()
    )

    if not department:

        raise HTTPException(
            status_code=404,
            detail="Department not found"
        )

    return department


def update_department(
    db: Session,
    department_id: int,
    updates: DepartmentUpdate
) -> Department:

    department = get_department_by_id(
        db,
        department_id
    )


    update_data = updates.model_dump(
        exclude_unset=True
    )


    for key, value in update_data.items():

        setattr(
            department,
            key,
            value
        )


    db.commit()

    db.refresh(department)

    return department


def delete_department(
    db: Session,
    department_id: int
):

    department = get_department_by_id(
        db,
        department_id
    )


    db.delete(department)

    db.commit()


    return {
        "detail": "Department deleted successfully"
    }