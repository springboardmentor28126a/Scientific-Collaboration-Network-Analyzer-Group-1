from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from ..auth import get_current_user
from ..database import get_db
from ..models import User, UserRole, Publication, Conference, ConferenceRegistration, Review, ResearcherProfile, Institution, publication_author, ResearchProject, ProjectMember, Collaboration, Citation, ProjectStatus
from ..schemas import DashboardStats

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

@router.get("/stats", response_model=DashboardStats)
def dashboard_stats(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = current_user.researcher_profile
    if current_user.role == UserRole.SYSTEM_ADMIN:
        by_institution = (db.query(Institution.name, func.count(Publication.id)).outerjoin(ResearcherProfile, ResearcherProfile.institution_id == Institution.id)
            .outerjoin(publication_author, publication_author.c.user_id == ResearcherProfile.user_id)
            .outerjoin(Publication, Publication.id == publication_author.c.publication_id).group_by(Institution.id).all())
        return DashboardStats(
            users_count=db.query(User).count(), researchers_count=db.query(User).filter(User.role == UserRole.RESEARCHER).count(),
            institution_admins_count=db.query(User).filter(User.role == UserRole.INSTITUTION_ADMIN).count(),
            reviewers_count=db.query(User).filter(User.role == UserRole.REVIEWER).count(), institutions_count=db.query(Institution).count(),
            publications_count=db.query(Publication).count(), conferences_count=db.query(Conference).count(),
            active_projects=db.query(ResearchProject).filter(ResearchProject.status == ProjectStatus.ACTIVE).count(),
            collaboration_count=db.query(Collaboration).filter(Collaboration.status == "active").count(),
            publications_by_institution=[{"name": name, "count": count} for name, count in by_institution],
            recent_users=[{"id": user.id, "name": user.full_name, "role": user.role.value, "created_at": user.created_at} for user in db.query(User).order_by(User.created_at.desc()).limit(5)])
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
        conferences = (db.query(Conference).join(User, Conference.created_by_id == User.id)
            .filter(User.assigned_institution_id == institution_id).count())
        reviewers = db.query(User).join(ResearcherProfile).filter(ResearcherProfile.institution_id == institution_id, User.role == UserRole.REVIEWER).count()
        return DashboardStats(publications_count=publications, conferences_count=conferences, researchers_count=researchers, reviewers_count=reviewers, active_projects=db.query(ResearchProject).filter(ResearchProject.institution_id == institution_id, ResearchProject.status == ProjectStatus.ACTIVE).count(), collaboration_count=db.query(Collaboration).filter(Collaboration.institution_id == institution_id, Collaboration.status == "active").count())
    publications = db.query(Publication).filter(Publication.created_by_id == current_user.id).count()
    conferences = db.query(ConferenceRegistration).filter(ConferenceRegistration.user_id == current_user.id).count()
    active_projects = db.query(ResearchProject).outerjoin(ProjectMember).filter((ResearchProject.created_by == current_user.id) | (ProjectMember.researcher_id == current_user.id), ResearchProject.status == ProjectStatus.ACTIVE).distinct().count()
    collaborators = db.query(Collaboration).filter(((Collaboration.researcher1_id == current_user.id) | (Collaboration.researcher2_id == current_user.id)), Collaboration.status == "active").count()
    return DashboardStats(publications_count=publications, conferences_count=conferences, h_index=profile.h_index if profile else 0, active_projects=active_projects, collaboration_count=collaborators)
