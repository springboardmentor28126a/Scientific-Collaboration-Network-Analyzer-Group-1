from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.database.database import get_db
from backend.database.models import User, Institution

from backend.utils.dependencies import require_permission

router = APIRouter(
    prefix="/faculty",
    tags=["Faculty"]
)


# ==============================
# Dashboard
# ==============================

@router.get("/dashboard")
def faculty_dashboard(

    current_user: User = Depends(
        require_permission("researcher:view")
    ),

    db: Session = Depends(get_db)

):

    researchers = (
        db.query(User)
        .filter(
            User.role == "Researcher",
            User.institution_id == current_user.institution_id
        )
        .count()
    )

    students = (
        db.query(User)
        .filter(
            User.role == "Student",
            User.institution_id == current_user.institution_id
        )
        .count()
    )

    return {

        "institution": current_user.institution_name,

        "researchers": researchers,

        "students": students

    }


# ==============================
# View Researchers
# ==============================

@router.get("/researchers")
def get_researchers(

    current_user: User = Depends(
        require_permission("researcher:view")
    ),

    db: Session = Depends(get_db)

):

    return (

        db.query(User)

        .filter(

            User.role == "Researcher",

            User.institution_id == current_user.institution_id

        )

        .all()

    )


# ==============================
# View Students
# ==============================

@router.get("/students")
def get_students(

    current_user: User = Depends(
        require_permission("student:view")
    ),

    db: Session = Depends(get_db)

):

    return (

        db.query(User)

        .filter(

            User.role == "Student",

            User.institution_id == current_user.institution_id

        )

        .all()

    )


# ==============================
# Update Researcher
# ==============================

@router.put("/researcher/{user_id}")
def update_researcher(

    user_id: int,

    designation: str,

    department: str,

    current_user: User = Depends(
        require_permission("researcher:update")
    ),

    db: Session = Depends(get_db)

):

    researcher = (

        db.query(User)

        .filter(User.id == user_id)

        .first()

    )

    if not researcher:

        raise HTTPException(
            status_code=404,
            detail="Researcher not found."
        )

    if researcher.role != "Researcher":

        raise HTTPException(
            status_code=400,
            detail="User is not a researcher."
        )

    if researcher.institution_id != current_user.institution_id:

        raise HTTPException(
            status_code=403,
            detail="You can manage only your institution."
        )

    researcher.designation = designation
    researcher.department = department

    db.commit()

    db.refresh(researcher)

    return {

        "message": "Researcher updated successfully.",

        "researcher": researcher

    }


# ==============================
# Update Student
# ==============================

@router.put("/student/{user_id}")
def update_student(

    user_id: int,

    department: str,

    current_user: User = Depends(
        require_permission("student:update")
    ),

    db: Session = Depends(get_db)

):

    student = (

        db.query(User)

        .filter(User.id == user_id)

        .first()

    )

    if not student:

        raise HTTPException(
            status_code=404,
            detail="Student not found."
        )

    if student.role != "Student":

        raise HTTPException(
            status_code=400,
            detail="User is not a student."
        )

    if student.institution_id != current_user.institution_id:

        raise HTTPException(
            status_code=403,
            detail="You can manage only your institution."
        )

    student.department = department

    db.commit()

    db.refresh(student)

    return {

        "message": "Student updated successfully.",

        "student": student

    }


# ==============================
# Update Institution
# ==============================

@router.put("/institution")
def update_institution(

    institution_name: str,

    current_user: User = Depends(
        require_permission("institution:update")
    ),

    db: Session = Depends(get_db)

):

    institution = (

        db.query(Institution)

        .filter(

            Institution.id == current_user.institution_id

        )

        .first()

    )

    if not institution:

        raise HTTPException(
            status_code=404,
            detail="Institution not found."
        )

    institution.name = institution_name

    db.commit()

    db.refresh(institution)

    return {

        "message": "Institution updated successfully.",

        "institution": institution

    }