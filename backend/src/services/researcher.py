from datetime import datetime

from sqlalchemy.orm import Session

from models.researcher import Researcher
from models.notification import Notification


# =========================================================
# GET ALL RESEARCHERS
# =========================================================

def get_researchers(db: Session):
    return (
        db.query(Researcher)
        .order_by(Researcher.id.desc())
        .all()
    )


# =========================================================
# GET ONE RESEARCHER
# =========================================================

def get_researcher(
    db: Session,
    researcher_id: int,
):
    return (
        db.query(Researcher)
        .filter(
            Researcher.id == researcher_id
        )
        .first()
    )


# =========================================================
# CREATE RESEARCHER
# =========================================================

def create_researcher(
    db: Session,
    data,
    current_user_id: int,
):
    researcher_data = data.model_dump()

    researcher = Researcher(
        user_id=current_user_id,
        **researcher_data,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )

    db.add(researcher)

    try:
        # Save the researcher first so that the researcher
        # exists successfully before creating the notification.
        db.commit()
        db.refresh(researcher)

        # =====================================================
        # CREATE NOTIFICATION
        # =====================================================

        notification = Notification(
            user_id=current_user_id,
            title="New Researcher Added",
            message=(
                f"{researcher.full_name} was added "
                "to the researcher directory."
            ),
            type="researcher",
            is_read=False,
        )

        db.add(notification)
        db.commit()

    except Exception:
        db.rollback()
        raise

    return researcher


# =========================================================
# UPDATE RESEARCHER
# =========================================================

def update_researcher(
    db: Session,
    researcher_id: int,
    data,
):
    researcher = (
        db.query(Researcher)
        .filter(
            Researcher.id == researcher_id
        )
        .first()
    )

    if not researcher:
        raise ValueError(
            "Researcher not found."
        )

    updates = data.model_dump(
        exclude_unset=True
    )

    for field, value in updates.items():
        setattr(
            researcher,
            field,
            value,
        )

    researcher.updated_at = datetime.utcnow()

    try:
        db.commit()
        db.refresh(researcher)
    except Exception:
        db.rollback()
        raise

    return researcher


# =========================================================
# DELETE RESEARCHER
# =========================================================

def delete_researcher(
    db: Session,
    researcher_id: int,
):
    researcher = (
        db.query(Researcher)
        .filter(
            Researcher.id == researcher_id
        )
        .first()
    )

    if not researcher:
        raise ValueError(
            "Researcher not found."
        )

    try:
        db.delete(researcher)
        db.commit()
    except Exception:
        db.rollback()
        raise

    return True