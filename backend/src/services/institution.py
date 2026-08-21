from sqlalchemy.orm import Session
from fastapi import HTTPException

from models.institution import Institution
from models.notification import Notification

from schemas.institution import (
    InstituteCreate,
    InstitutionUpdate,
)


# =========================================================
# CREATE INSTITUTION
# =========================================================

def create_institution(
    db: Session,
    data: InstituteCreate,
    current_user_id: int,
) -> Institution:

    new_institution = Institution(
        **data.dict()
    )

    db.add(new_institution)

    try:
        # Save institution first
        db.commit()
        db.refresh(new_institution)

        # =====================================================
        # CREATE NOTIFICATION
        # =====================================================

        notification = Notification(
            user_id=current_user_id,
            title="New Institution Added",
            message=(
                f"{new_institution.name} was added "
                "to the institution directory."
            ),
            type="institution",
            is_read=False,
        )

        db.add(notification)
        db.commit()

    except Exception:
        db.rollback()
        raise

    return new_institution


# =========================================================
# GET ALL INSTITUTIONS
# =========================================================

def get_all_institutes(
    db: Session,
):
    return (
        db.query(Institution)
        .all()
    )


# =========================================================
# GET INSTITUTION BY ID
# =========================================================

def get_institution_by_id(
    db: Session,
    institution_id: int,
) -> Institution:

    institution = (
        db.query(Institution)
        .filter(
            Institution.id == institution_id
        )
        .first()
    )

    if not institution:
        raise HTTPException(
            status_code=404,
            detail="Institution is not found",
        )

    return institution


# =========================================================
# UPDATE INSTITUTION
# =========================================================

def update_institution(
    db: Session,
    institution_id: int,
    updates: InstitutionUpdate,
) -> Institution:

    institution = get_institution_by_id(
        db,
        institution_id,
    )

    for key, value in updates.dict(
        exclude_unset=True
    ).items():

        setattr(
            institution,
            key,
            value,
        )

    db.commit()
    db.refresh(institution)

    return institution


# =========================================================
# DELETE INSTITUTION
# =========================================================

def delete_institution(
    db: Session,
    institution_id: int,
):

    institution = get_institution_by_id(
        db,
        institution_id,
    )

    db.delete(institution)
    db.commit()

    return {
        "detail": "Institution deleted successfully"
    }