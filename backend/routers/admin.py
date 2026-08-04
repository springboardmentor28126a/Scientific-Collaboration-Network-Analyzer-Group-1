from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.database.database import get_db
from backend.database.models import (
    User,
    Institution,
    Publication
)

from backend.utils.dependencies import require_permission

router = APIRouter(
    prefix="/admin",
    tags=["System Admin"]
)

VALID_ROLES = [
    "Researcher",
    "Reviewer",
    "Student",
    "Faculty",
    "Institution Admin",
    "System Admin"
]

TRANSFER_ROLES = {
    "Researcher",
    "Reviewer",
    "Faculty",
    "Institution Admin",
    "Student",
}


# =====================================================
# Dashboard
# =====================================================

@router.get("/dashboard")
def admin_dashboard(

    current_user: User = Depends(
        require_permission("*")
    ),

    db: Session = Depends(get_db)

):

    return {

        "users": db.query(User).count(),

        "institutions": db.query(Institution).count(),

        "publications": db.query(Publication).count(),

        "researchers": db.query(User).filter(
            User.role == "Researcher"
        ).count(),

        "students": db.query(User).filter(
            User.role == "Student"
        ).count(),

        "reviewers": db.query(User).filter(
            User.role == "Reviewer"
        ).count(),

        "faculty": db.query(User).filter(
            User.role == "Faculty"
        ).count()

    }


# =====================================================
# USERS
# =====================================================

@router.get("/users")
def get_users(

    current_user: User = Depends(
        require_permission("*")
    ),

    db: Session = Depends(get_db)

):

    return db.query(User).all()


@router.delete("/users/{user_id}")
def delete_user(

    user_id: int,

    current_user: User = Depends(
        require_permission("*")
    ),

    db: Session = Depends(get_db)

):

    if current_user.id == user_id:
        raise HTTPException(
            status_code=400,
            detail="You cannot delete your own account."
        )

    user = (
        db.query(User)
        .filter(User.id == user_id)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found."
        )

    db.delete(user)

    db.commit()

    return {
        "message": "User deleted successfully."
    }


@router.put("/users/{user_id}/role")
def change_role(

    user_id: int,

    role: str,
    replacement_role: str = "Researcher",

    current_user: User = Depends(
        require_permission("*")
    ),

    db: Session = Depends(get_db)

):

    if role not in VALID_ROLES:
        raise HTTPException(
            status_code=400,
            detail="Invalid role."
        )

    user = (
        db.query(User)
        .filter(User.id == user_id)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found."
        )

    if user.id == current_user.id:
        raise HTTPException(status_code=400, detail="Use ownership transfer to change the current System Admin.")

    if role == "System Admin":
        if db.query(User).filter(User.role == "System Admin").count() != 1:
            raise HTTPException(
                status_code=409,
                detail="System Admin ownership is inconsistent; resolve the existing administrators first.",
            )
        if replacement_role not in TRANSFER_ROLES:
            raise HTTPException(status_code=400, detail="Invalid replacement role.")
        if not user.is_verified:
            raise HTTPException(status_code=400, detail="Only a verified user can become System Admin.")
        current_user.role = replacement_role
        db.flush()
        user.role = "System Admin"
        db.commit()
        db.refresh(user)
        return {"message": "System Admin ownership transferred successfully.", "user": user}

    user.role = role

    db.commit()

    db.refresh(user)

    return {

        "message": "Role updated successfully.",

        "user": user

    }


# =====================================================
# INSTITUTIONS
# =====================================================

@router.get("/institutions")
def get_institutions(

    current_user: User = Depends(
        require_permission("*")
    ),

    db: Session = Depends(get_db)

):

    return db.query(Institution).all()


@router.put("/institution/{institution_id}")
def update_institution(

    institution_id: int,

    name: str,

    current_user: User = Depends(
        require_permission("*")
    ),

    db: Session = Depends(get_db)

):

    institution = (
        db.query(Institution)
        .filter(Institution.id == institution_id)
        .first()
    )

    if not institution:
        raise HTTPException(
            status_code=404,
            detail="Institution not found."
        )

    institution.name = name

    db.commit()

    db.refresh(institution)

    return {

        "message": "Institution updated successfully.",

        "institution": institution

    }


@router.delete("/institution/{institution_id}")
def delete_institution(

    institution_id: int,

    current_user: User = Depends(
        require_permission("*")
    ),

    db: Session = Depends(get_db)

):

    institution = (
        db.query(Institution)
        .filter(Institution.id == institution_id)
        .first()
    )

    if not institution:
        raise HTTPException(
            status_code=404,
            detail="Institution not found."
        )

    db.delete(institution)

    db.commit()

    return {

        "message": "Institution deleted successfully."

    }


# =====================================================
# PUBLICATIONS
# =====================================================

@router.get("/publications")
def get_publications(

    current_user: User = Depends(
        require_permission("*")
    ),

    db: Session = Depends(get_db)

):

    return db.query(Publication).all()


@router.delete("/publication/{publication_id}")
def delete_publication(

    publication_id: int,

    current_user: User = Depends(
        require_permission("*")
    ),

    db: Session = Depends(get_db)

):

    publication = (
        db.query(Publication)
        .filter(Publication.id == publication_id)
        .first()
    )

    if not publication:
        raise HTTPException(
            status_code=404,
            detail="Publication not found."
        )

    db.delete(publication)

    db.commit()

    return {

        "message": "Publication deleted successfully."

    }


@router.put("/publication/{publication_id}")
def update_publication_status(

    publication_id: int,

    status: str,

    current_user: User = Depends(
        require_permission("*")
    ),

    db: Session = Depends(get_db)

):

    publication = (
        db.query(Publication)
        .filter(Publication.id == publication_id)
        .first()
    )

    if not publication:
        raise HTTPException(
            status_code=404,
            detail="Publication not found."
        )

    publication.status = status

    db.commit()

    db.refresh(publication)

    return {

        "message": "Publication updated successfully.",

        "publication": publication

    }


@router.post("/transfer-ownership")
def transfer_ownership(
    new_admin_id: int,
    replacement_role: str = "Researcher",
    current_user: User = Depends(require_permission("*")),
    db: Session = Depends(get_db),
):
    if replacement_role not in TRANSFER_ROLES:
        raise HTTPException(status_code=400, detail="Invalid replacement role.")
    if new_admin_id == current_user.id:
        raise HTTPException(status_code=400, detail="Choose a different verified user.")
    if db.query(User).filter(User.role == "System Admin").count() != 1:
        raise HTTPException(
            status_code=409,
            detail="System Admin ownership is inconsistent; resolve the existing administrators first.",
        )

    new_admin = db.query(User).filter(User.id == new_admin_id).first()
    if not new_admin:
        raise HTTPException(status_code=404, detail="User not found.")
    if not new_admin.is_verified:
        raise HTTPException(status_code=400, detail="Only a verified user can become System Admin.")

    current_user.role = replacement_role
    db.flush()
    new_admin.role = "System Admin"
    db.commit()
    db.refresh(new_admin)
    return {
        "message": "System Admin ownership transferred successfully.",
        "previous_admin_role": replacement_role,
        "user": new_admin,
    }
