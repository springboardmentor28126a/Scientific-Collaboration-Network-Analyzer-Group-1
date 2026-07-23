from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from backend.database.database import get_db
from backend.database.models import (
    Publication,
    Collaboration,
)

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"]
)


@router.get("/stats/{user_id}")
def dashboard_stats(
    user_id: int,
    db: Session = Depends(get_db)
):

    publications = db.query(Publication).filter(
        Publication.researcher_id == user_id
    ).count()

    collaborations = db.query(Collaboration).filter(
        (Collaboration.user1_id == user_id) |
        (Collaboration.user2_id == user_id)
    ).count()

    pending_reviews = db.query(Publication).filter(
        Publication.researcher_id == user_id,
        Publication.status == "Submitted"
    ).count()

    citations = 0

    return {

        "publications": publications,

        "collaborations": collaborations,

        "citations": citations,

        "pending_reviews": pending_reviews

    }