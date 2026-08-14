from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime

from ..auth import get_current_user
from ..database import get_db
from ..models import User, UserRole, Publication, Conference, ConferenceRegistration, Review, ReviewStatus, ResearcherProfile, Institution, publication_author, ResearchProject, ProjectMember, CollaborationRequest, Citation, ProjectStatus, RoleRequest
from ..schemas import DashboardStats

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

@router.get("/stats", response_model=DashboardStats)
def dashboard_stats(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = current_user.researcher_profile
    month_start = datetime.utcnow().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    if current_user.role == UserRole.SYSTEM_ADMIN:
        by_institution = (db.query(Institution.name, func.count(Publication.id)).outerjoin(ResearcherProfile, ResearcherProfile.institution_id == Institution.id)
            .outerjoin(publication_author, publication_author.c.user_id == ResearcherProfile.user_id)
            .outerjoin(Publication, Publication.id == publication_author.c.publication_id).group_by(Institution.id).all())
        return DashboardStats(
            users_count=db.query(User).count(), researchers_count=db.query(User).filter(User.role == UserRole.RESEARCHER).count(),
            institution_admins_count=db.query(User).filter(User.role == UserRole.INSTITUTION_ADMIN).count(),
            reviewers_count=db.query(User).filter(User.role == UserRole.REVIEWER).count(), institutions_count=db.query(Institution).count(),
            publications_count=db.query(Publication).count(), conferences_count=db.query(Conference).count(),
            active_projects=db.query(ResearchProject).count(),
            collaboration_count=db.query(CollaborationRequest).filter(CollaborationRequest.status == "accepted").count(),
            active_users_count=db.query(User).filter(User.is_active == True).count(),
            pending_role_requests_count=db.query(RoleRequest).filter(RoleRequest.status == "pending").count(),
            new_users_this_month=db.query(User).filter(User.created_at >= month_start).count(),
            new_publications_this_month=db.query(Publication).filter(Publication.created_at >= month_start).count(),
            new_collaborations_this_month=db.query(CollaborationRequest).filter(CollaborationRequest.created_at >= month_start).count(),
            citations_count=db.query(Citation).count(),
            publications_by_institution=[{"name": name, "count": count} for name, count in by_institution],
            recent_users=[{"id": user.id, "name": user.full_name, "role": user.role.value, "created_at": user.created_at} for user in db.query(User).order_by(User.created_at.desc()).limit(5)])
    if current_user.role == UserRole.REVIEWER:
        reviews = db.query(Review).filter(Review.reviewer_id == current_user.id)
        pending = reviews.filter(Review.status == ReviewStatus.PENDING).count()
        drafts = reviews.filter(Review.status == ReviewStatus.DRAFT).count()
        completed = reviews.filter(Review.status == ReviewStatus.COMPLETED).count()
        revision_required = reviews.filter(Review.status == ReviewStatus.REVISION_REQUIRED).count()
        recent = (reviews.order_by(Review.updated_at.desc()).limit(5).all())
        return DashboardStats(
            pending_reviews=pending, under_review_count=drafts, completed_reviews=completed,
            revision_required_count=revision_required,
            recent_review_assignments=[{
                "id": item.id, "publication_id": item.publication_id,
                "publication_title": item.publication.title if item.publication else "Untitled publication",
                "status": item.status.name.lower() if hasattr(item.status, "name") else str(item.status).lower(),
                "due_date": item.due_date, "created_at": item.created_at,
            } for item in recent],
        )
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
        project_count = db.query(ResearchProject).filter(ResearchProject.institution_id == institution_id).count()
        institution = db.get(Institution, institution_id)
        publication_ids = db.query(Publication.id).join(publication_author, publication_author.c.publication_id == Publication.id).join(ResearcherProfile, ResearcherProfile.user_id == publication_author.c.user_id).filter(ResearcherProfile.institution_id == institution_id)
        return DashboardStats(publications_count=publications, conferences_count=conferences, researchers_count=researchers, reviewers_count=reviewers, active_projects=project_count, collaboration_count=db.query(CollaborationRequest).filter(CollaborationRequest.institution_id == institution_id, CollaborationRequest.status == "accepted").count(), pending_requests_count=db.query(CollaborationRequest).filter(CollaborationRequest.institution_id == institution_id, CollaborationRequest.status == "pending").count(), citations_count=db.query(Citation).filter((Citation.citing_publication_id.in_(publication_ids)) | (Citation.cited_publication_id.in_(publication_ids))).count(), institution_name=institution.name if institution else None)
    publications = db.query(Publication).filter(Publication.created_by_id == current_user.id).count()
    conferences = db.query(ConferenceRegistration).filter(ConferenceRegistration.user_id == current_user.id).count()
    active_projects = db.query(ResearchProject).outerjoin(ProjectMember).filter((ResearchProject.created_by == current_user.id) | (ProjectMember.researcher_id == current_user.id)).distinct().count()
    collaborators = db.query(CollaborationRequest).filter(((CollaborationRequest.sender_id == current_user.id) | (CollaborationRequest.receiver_id == current_user.id)), CollaborationRequest.status == "accepted").count()
    return DashboardStats(publications_count=publications, conferences_count=conferences, h_index=profile.h_index if profile else 0, active_projects=active_projects, collaboration_count=collaborators)
