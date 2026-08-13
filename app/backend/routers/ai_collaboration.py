from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.backend.database.database import get_db
from app.backend.services.ai_collaboration_service import (
    DEFAULT_RECOMMENDATION_LIMIT,
    get_collaboration_recommendations,
)
from app.backend.utils.permissions import get_current_user

# ---------------------------------------------------------------------------
# AI Collaboration Recommender
#
# Read-only endpoint that scores every other researcher in the database
# against a selected researcher using real, retrieved data (research
# interests, skills, publications, conferences, institution/department and
# existing collaboration/citation records) and returns the best potential
# collaborators with an AI-assisted compatibility score and explanation.
#
# All logic lives in services/ai_collaboration_service.py -- this router
# only handles HTTP concerns (auth, validation, 404s), matching the rest of
# the project's router/service split.
# ---------------------------------------------------------------------------

router = APIRouter(prefix="/api/ai/collaboration", tags=["AI Collaboration"])


@router.get("/{researcher_id}")
def get_ai_collaboration_recommendations(
    researcher_id: int,
    limit: int = Query(
        DEFAULT_RECOMMENDATION_LIMIT,
        ge=1,
        le=20,
        description="Maximum number of recommended collaborators to return",
    ),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    result = get_collaboration_recommendations(db, researcher_id, limit=limit)

    if result is None:
        raise HTTPException(status_code=404, detail="Researcher not found")

    return result
