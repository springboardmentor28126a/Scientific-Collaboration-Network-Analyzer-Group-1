from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.database.database import get_db
from backend.database.models import Publication
from backend.models.research_group_member import ResearchGroupMember

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"]
)


@router.get("/stats/{user_id}")
def dashboard_stats(
    user_id: int,
    db: Session = Depends(get_db)
):

    # Total publications by the user
    publications = (
        db.query(Publication)
        .filter(Publication.researcher_id == user_id)
        .count()
    )

    # Total research groups joined
    groups = (
        db.query(ResearchGroupMember)
        .filter(ResearchGroupMember.user_id == user_id)
        .count()
    )

    # Publications awaiting review
    pending_reviews = (
        db.query(Publication)
        .filter(
            Publication.researcher_id == user_id,
            Publication.status == "Submitted"
        )
        .count()
    )

    # Placeholder until citation tracking is implemented
    citations = 0

    return {
        "publications": publications,
        "groups": groups,
        "citations": citations,
        "pending_reviews": pending_reviews
    }