from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload

from ..auth import get_current_user
from ..database import get_db
from ..models import Publication, PublicationStatus, ResearcherProfile, User, UserRole
from ..recommendation_service import jaccard, normalized_overlap, profile_text, shared_terms, split_topics, tfidf_cosine

router = APIRouter(prefix="/ai", tags=["AI recommendations"])


def require_research_profile(current_user: User, db: Session) -> ResearcherProfile:
    if current_user.role not in (UserRole.RESEARCHER, UserRole.SYSTEM_ADMIN):
        raise HTTPException(status_code=403, detail="AI recommendations are available to researcher accounts only")
    profile = db.query(ResearcherProfile).filter(ResearcherProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Create your researcher profile before requesting recommendations")
    if not (profile.research_interests or profile.skills):
        raise HTTPException(status_code=422, detail="Add research interests or skills to receive recommendations")
    return profile


def visible_profiles(current_user: User, db: Session):
    query = db.query(ResearcherProfile).options(joinedload(ResearcherProfile.user), joinedload(ResearcherProfile.institution))
    if current_user.role == UserRole.INSTITUTION_ADMIN:
        own = current_user.researcher_profile
        return [] if not own or not own.institution_id else query.filter(ResearcherProfile.institution_id == own.institution_id).all()
    return query.all()


@router.get("/researcher-recommendations")
def researcher_recommendations(
    limit: int = Query(6, ge=1, le=20),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile = require_research_profile(current_user, db)
    candidates = [item for item in visible_profiles(current_user, db) if item.user_id != current_user.id]
    if not candidates:
        return {"recommendations": [], "message": "No other researcher profiles are available yet."}

    all_publications = db.query(Publication).options(joinedload(Publication.authors)).all()
    papers_by_user = {}
    for publication in all_publications:
        for author in publication.authors:
            papers_by_user.setdefault(author.id, []).append(publication)
    current_text = profile_text(profile, papers_by_user.get(current_user.id, []))
    # Other researchers' drafts are deliberately excluded from both scores and output.
    candidate_texts = [profile_text(item, [paper for paper in papers_by_user.get(item.user_id, []) if paper.status != PublicationStatus.DRAFT]) for item in candidates]
    cosine_scores = tfidf_cosine(current_text, candidate_texts)
    own_interests, own_skills = split_topics(profile.research_interests), split_topics(profile.skills)
    results = []
    for candidate, cosine in zip(candidates, cosine_scores):
        interests, skills = split_topics(candidate.research_interests), split_topics(candidate.skills)
        common_interests = normalized_overlap(own_interests, interests)
        matching_skills = normalized_overlap(own_skills, skills)
        # TF-IDF captures publication/bio language; explicit overlaps keep it explainable.
        score = round(min(100, 100 * (0.60 * cosine + 0.25 * jaccard(own_interests, interests) + 0.15 * jaccard(own_skills, skills))))
        if score == 0:
            continue
        relevant = [
            {"id": paper.id, "title": paper.title}
            for paper in papers_by_user.get(candidate.user_id, [])
            if paper.status != PublicationStatus.DRAFT and shared_terms(current_text, f"{paper.title} {paper.abstract}")
        ][:3]
        overlap = common_interests or matching_skills or shared_terms(current_text, candidate_texts[candidates.index(candidate)])
        reason = (f"Shared focus on {', '.join(overlap[:3])}." if overlap else "Related research profile and publication language.")
        results.append({
            "researcher_id": candidate.id, "user_id": candidate.user_id,
            "name": candidate.user.full_name if candidate.user else "Researcher",
            "profile": {"department": candidate.department, "designation": candidate.designation, "institution_name": candidate.institution.name if candidate.institution else None},
            "match_score": score, "common_interests": common_interests,
            "matching_skills": matching_skills, "relevant_publications": relevant, "reason": reason,
        })
    return {"recommendations": sorted(results, key=lambda item: item["match_score"], reverse=True)[:limit]}


@router.get("/publication-recommendations")
def publication_recommendations(
    limit: int = Query(6, ge=1, le=20),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile = require_research_profile(current_user, db)
    own_papers = db.query(Publication).options(joinedload(Publication.authors)).all()
    current_text = profile_text(profile, [paper for paper in own_papers if any(author.id == current_user.id for author in paper.authors)])
    # Do not recommend a user's own publications or other users' private drafts.
    publications = [paper for paper in own_papers if paper.status != PublicationStatus.DRAFT and not any(author.id == current_user.id for author in paper.authors)]
    similarities = tfidf_cosine(current_text, [f"{paper.title or ''} {paper.abstract or ''}" for paper in publications])
    results = []
    for paper, cosine in zip(publications, similarities):
        text = f"{paper.title or ''} {paper.abstract or ''}"
        topics = shared_terms(current_text, text)
        score = round(100 * cosine)
        if score == 0:
            continue
        authors = [author.full_name for author in paper.authors if author.full_name]
        reason = f"Matches your research profile through {', '.join(topics[:3])}." if topics else "Related to the language in your research profile."
        results.append({"publication_id": paper.id, "title": paper.title, "authors": authors, "abstract": paper.abstract, "match_score": score, "matching_topics": topics, "reason": reason})
    return {"recommendations": sorted(results, key=lambda item: item["match_score"], reverse=True)[:limit]}
