from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.database.database import get_db
from backend.database.models import Publication, User
from backend.schemas.security import AIChatRequest
from backend.services.ai_service import ai_configuration, ask_ai
from backend.services.publication_ai_service import extract_publication_text, parse_analysis, publication_context
from backend.services.research_intelligence_service import build_research_intelligence
from backend.utils.dependencies import require_permission, require_verified_user

router = APIRouter(prefix="/ai", tags=["SCNA Research AI"])


@router.get("/status")
def status():
    return ai_configuration()


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
    candidates = db.query(User).filter(
        User.id != current_user.id,
        User.role == "Researcher",
        User.account_status == "Active",
        User.is_verified.is_(True),
    ).limit(100).all()
    scored = []
    for candidate in candidates:
        candidate_interests = (candidate.research_interests or "").lower()
        overlap = [item.strip() for item in interests if item.strip() and item.strip() in candidate_interests]
        if overlap:
            scored.append({"id": candidate.id, "name": candidate.name, "role": candidate.role, "research_interests": candidate.research_interests, "matched_interests": overlap})
    return {"source": "SCNA database records", "recommendations": scored[:20]}


def _authorized_publication(publication_id: int, current_user: User, db: Session) -> Publication:
    publication = db.query(Publication).filter(Publication.id == publication_id).first()
    if publication is None:
        raise HTTPException(status_code=404, detail="Publication not found.")
    # publication:view is intentionally the same permission used by the
    # existing publication details route; no new access model is introduced.
    return publication


def _publication_content_or_error(publication: Publication) -> str:
    content = extract_publication_text(publication)
    if not content:
        raise HTTPException(status_code=422, detail="Publication content is not available for AI analysis.")
    return content


@router.get("/publication/{publication_id}/analysis")
def publication_analysis(
    publication_id: int,
    current_user: User = Depends(require_permission("publication:view")),
    db: Session = Depends(get_db),
):
    publication = _authorized_publication(publication_id, current_user, db)
    content = _publication_content_or_error(publication)
    prompt = """Analyze the supplied publication content. Return JSON only with these keys: summary, research_problem, methodology, major_findings, conclusion, research_topic, objectives, keywords, research_domain, research_gaps, future_research. Use arrays for objectives, keywords, research_gaps, and future_research. Ground every factual statement in the supplied content. For gaps and future research, label them as AI-generated analysis or suggestions and do not present assumptions as verified facts."""
    try:
        raw = ask_ai(prompt, publication_context(publication, content))
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail="AI_NOT_CONFIGURED" if str(exc) == "AI_NOT_CONFIGURED" else "AI_PROVIDER_ERROR") from exc
    except Exception as exc:
        raise HTTPException(status_code=503, detail="The publication AI service is temporarily unavailable.") from exc
    return {"publication": {"id": publication.id, "title": publication.title, "authors": publication.authors, "journal": publication.journal, "publication_year": publication.publication_year, "keywords": publication.keywords, "status": publication.status}, "analysis": parse_analysis(raw), "source": "AI-generated analysis grounded in the authorized publication content."}


@router.post("/publication/{publication_id}/ask")
def ask_about_publication(
    publication_id: int,
    payload: AIChatRequest,
    current_user: User = Depends(require_permission("publication:view")),
    db: Session = Depends(get_db),
):
    publication = _authorized_publication(publication_id, current_user, db)
    content = _publication_content_or_error(publication)
    prompt = f"Answer the user's question only from the supplied publication content. If the answer is not present, say that it is not available in the publication content. Clearly label interpretation as AI-generated analysis. User question: {payload.question}"
    try:
        answer = ask_ai(prompt, publication_context(publication, content))
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail="AI_NOT_CONFIGURED" if str(exc) == "AI_NOT_CONFIGURED" else "AI_PROVIDER_ERROR") from exc
    except Exception as exc:
        raise HTTPException(status_code=503, detail="The publication AI service is temporarily unavailable.") from exc
    return {"answer": answer, "source": "AI response grounded in the authorized publication content."}


@router.get("/research-trends")
def research_trends(
    current_user: User = Depends(require_permission("analytics:view")),
    db: Session = Depends(get_db),
):
    intelligence = build_research_intelligence(current_user, db)
    ai_insight = None
    ai_available = False
    if intelligence["overview"]["publications"] or intelligence["overview"]["researchers"]:
        try:
            ai_context = {
                "overview": intelligence["overview"],
                "research_trends": intelligence["research_trends"],
                "collaboration_insights": intelligence["collaboration_insights"],
            }
            ai_insight = ask_ai(
                "Provide concise research network insights grounded only in these SCNA aggregates. Mention uncertainty when historical data is insufficient. Do not invent facts or identifiers.",
                ai_context,
            )
            ai_available = True
        except RuntimeError:
            ai_insight = "AI-generated interpretation is currently unavailable. Database-derived insights remain available below."
        except Exception:
            ai_insight = "AI-generated interpretation is temporarily unavailable. Database-derived insights remain available below."
    else:
        ai_insight = "There is not enough SCNA data to generate network insights yet."
    return {**intelligence, "ai_available": ai_available, "ai_insight": ai_insight}
