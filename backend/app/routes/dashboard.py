from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from ..auth import get_current_user
from ..database import get_db
from ..models import User, UserRole, Publication, ConferenceRegistration, Review, ResearcherProfile, publication_author
from ..schemas import DashboardStats

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

@router.get("/stats", response_model=DashboardStats)
def dashboard_stats(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = current_user.researcher_profile
    if current_user.role == UserRole.REVIEWER:
        completed = db.query(Review).filter(Review.reviewer_id == current_user.id).count()
        pending = db.query(Publication).filter(Publication.status == "submitted").count() - completed
        return DashboardStats(pending_reviews=max(0, pending), completed_reviews=completed)
    if current_user.role == UserRole.INSTITUTION_ADMIN:
        institution_id = current_user.assigned_institution_id or (profile.institution_id if profile else None)
        if not institution_id:
            return DashboardStats()
        researchers = db.query(ResearcherProfile).filter(ResearcherProfile.institution_id == institution_id).count()
        publications = (db.query(Publication).join(publication_author, publication_author.c.publication_id == Publication.id)
            .join(ResearcherProfile, ResearcherProfile.user_id == publication_author.c.user_id)
            .filter(ResearcherProfile.institution_id == institution_id).distinct().count())
        return DashboardStats(publications_count=publications, researchers_count=researchers, collaboration_count=max(0, publications - researchers))
    publications = db.query(Publication).filter(Publication.created_by_id == current_user.id).count()
    conferences = db.query(ConferenceRegistration).filter(ConferenceRegistration.user_id == current_user.id).count()
    return DashboardStats(publications_count=publications, conferences_count=conferences, h_index=profile.h_index if profile else 0)
