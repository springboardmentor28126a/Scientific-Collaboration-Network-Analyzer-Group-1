from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.researcher import Researcher
from app.models.institution import Institution
from app.models.publication import Publication
from app.models.conference import Conference
from app.models.collaboration import Collaboration
from app.models.citation import Citation
from app.utils.constants import UserRole, CollaborationStatus


def get_analytics_summary(db: Session, current_user):
    institution_scope = None
    if current_user.role == UserRole.INSTITUTION_ADMIN.value:
        institution_scope = current_user.institution_id

    researcher_q = db.query(Researcher)
    publication_q = db.query(Publication).join(Researcher, Researcher.id == Publication.owner_researcher_id)

    if institution_scope:
        researcher_q = researcher_q.filter(Researcher.institution_id == institution_scope)
        publication_q = publication_q.filter(Researcher.institution_id == institution_scope)

    total_researchers = researcher_q.count()
    total_publications = publication_q.count()
    total_conferences = db.query(Conference).count()
    total_collaborations = (
        db.query(Collaboration).filter(Collaboration.status == CollaborationStatus.ACCEPTED).count()
    )
    total_citations = db.query(Citation).count()
    total_institutions = db.query(Institution).count() if not institution_scope else 1

    recent = (
        publication_q.order_by(Publication.created_at.desc()).limit(5).all()
    )
    recent_publications = []
    for p in recent:
        owner = db.query(Researcher).filter(Researcher.id == p.owner_researcher_id).first()
        recent_publications.append({
            "id": p.id,
            "title": p.title,
            "publication_type": p.publication_type,
            "status": p.status,
            "owner_first_name": owner.first_name,
            "owner_last_name": owner.last_name,
        })

    top_researchers_q = (
        db.query(
            Researcher.id,
            Researcher.first_name,
            Researcher.last_name,
            func.count(Publication.id).label("pub_count"),
        )
        .join(Publication, Publication.owner_researcher_id == Researcher.id)
    )
    if institution_scope:
        top_researchers_q = top_researchers_q.filter(Researcher.institution_id == institution_scope)

    top_researchers_rows = (
        top_researchers_q.group_by(Researcher.id, Researcher.first_name, Researcher.last_name)
        .order_by(func.count(Publication.id).desc())
        .limit(5)
        .all()
    )
    top_researchers = [
        {"researcher_id": rid, "first_name": fn, "last_name": ln, "publication_count": cnt}
        for rid, fn, ln, cnt in top_researchers_rows
    ]

    top_institutions = []
    if not institution_scope:
        top_inst_rows = (
            db.query(
                Institution.id,
                Institution.institution_name,
                func.count(func.distinct(Researcher.id)).label("researcher_count"),
                func.count(Publication.id).label("pub_count"),
            )
            .outerjoin(Researcher, Researcher.institution_id == Institution.id)
            .outerjoin(Publication, Publication.owner_researcher_id == Researcher.id)
            .group_by(Institution.id, Institution.institution_name)
            .order_by(func.count(Publication.id).desc())
            .limit(5)
            .all()
        )
        top_institutions = [
            {
                "institution_id": iid,
                "institution_name": name,
                "researcher_count": rc,
                "publication_count": pc,
            }
            for iid, name, rc, pc in top_inst_rows
        ]

    return {
        "total_researchers": total_researchers,
        "total_publications": total_publications,
        "total_conferences": total_conferences,
        "total_collaborations": total_collaborations,
        "total_citations": total_citations,
        "total_institutions": total_institutions,
        "recent_publications": recent_publications,
        "top_researchers": top_researchers,
        "top_institutions": top_institutions,
    }