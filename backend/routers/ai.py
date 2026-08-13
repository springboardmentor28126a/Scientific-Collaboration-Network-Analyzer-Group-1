from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.database.database import get_db
from backend.database.models import Publication, User
from backend.schemas.security import AIChatRequest
from backend.services.ai_service import ask_ai
from backend.utils.dependencies import require_verified_user

router = APIRouter(prefix="/ai", tags=["SCNA Research AI"])


@router.get("/status")
def status():
    import os
    return {"available": bool(os.getenv("AI_API_KEY") and os.getenv("AI_MODEL")), "reason": None if os.getenv("AI_API_KEY") and os.getenv("AI_MODEL") else "not_configured"}


def _research_context(user: User, db: Session) -> dict:
    publications = db.query(Publication).filter(Publication.researcher_id == user.id).limit(10).all()
    return {
        "requesting_user": {"name": user.name, "role": user.role, "research_interests": user.research_interests or ""},
        "requesting_user_publications": [{"title": p.title, "abstract": p.abstract or "", "year": p.publication_year} for p in publications],
    }


@router.post("/chat")
def chat(payload: AIChatRequest, current_user: User = Depends(require_verified_user), db: Session = Depends(get_db)):
    try:
        answer = ask_ai(payload.question, _research_context(current_user, db))
    except RuntimeError as exc:
        detail = "AI_NOT_CONFIGURED" if str(exc) == "AI_NOT_CONFIGURED" else "AI_PROVIDER_ERROR"
        raise HTTPException(status_code=503, detail=detail)
    except Exception:
        raise HTTPException(status_code=503, detail="The SCNA AI service is temporarily unavailable.")
    return {"answer": answer, "source": "AI-generated response grounded in the authorized SCNA context."}


@router.get("/recommendations")
def recommendations(current_user: User = Depends(require_verified_user), db: Session = Depends(get_db)):
    interests = (current_user.research_interests or "").lower().split(",")
    candidates = db.query(User).filter(User.id != current_user.id, User.account_status == "Active").limit(100).all()
    scored = []
    for candidate in candidates:
        candidate_interests = (candidate.research_interests or "").lower()
        overlap = [item.strip() for item in interests if item.strip() and item.strip() in candidate_interests]
        if overlap:
            scored.append({"id": candidate.id, "name": candidate.name, "role": candidate.role, "research_interests": candidate.research_interests, "matched_interests": overlap})
    return {"source": "SCNA database records", "recommendations": scored[:20]}
