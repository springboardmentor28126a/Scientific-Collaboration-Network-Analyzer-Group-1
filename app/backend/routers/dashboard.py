from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session
from app.backend.utils.permissions import require_role, get_current_user
from app.backend.database.database import get_db
from app.backend.models.collaboration import PublicationAuthor
from app.backend.models.conference import Conference, ConferenceParticipation
from app.backend.models.institution import Institution
from app.backend.models.project import ProjectAssignment, ResearchProject
from app.backend.models.publication import Publication
from app.backend.models.researcher import Researcher
from app.backend.models.user import User
from app.backend.models.citation import Citation

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/admin")
def admin_dashboard(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return {
        "users": db.query(User).count(),
        "researchers": db.query(Researcher).count(),
        "institutions": db.query(Institution).count(),
        "publications": db.query(Publication).count(),
        "projects": db.query(ResearchProject).count(),
        "conferences": db.query(Conference).count(),
        # Collaborations are actually created via the publication-authors
        # endpoint (that's what the "Add Collaboration" UI calls), so that
        # table -- not the separate, currently-unused Collaboration table --
        # reflects real collaboration activity.
        "collaborations": db.query(PublicationAuthor).count(),
        # Count real Citation records rather than summing the
        # Publication.citation_count field, which may not be kept in sync.
        "citations": db.query(Citation).count()
    }


@router.get("/researcher/{researcher_id}")
def researcher_dashboard(researcher_id: int, db: Session = Depends(get_db)):
    researcher = db.query(Researcher).filter(Researcher.id == researcher_id).first()
    if not researcher:
        raise HTTPException(status_code=404, detail="Researcher not found")

    pub_ids = [
        pa.publication_id for pa in db.query(PublicationAuthor).filter(
            PublicationAuthor.researcher_id == researcher_id
        ).all()
    ]
    primary_pubs = db.query(Publication).filter(Publication.researcher_id == researcher_id).all()
    all_pub_ids = set(pub_ids + [p.id for p in primary_pubs])

    pubs = db.query(Publication).filter(Publication.id.in_(all_pub_ids)).all() if all_pub_ids else []
    total_citations = sum(p.citation_count or 0 for p in pubs)

    recent_pubs = [
        {
            "id": p.id,
            "title": p.title,
            "publication_year": p.publication_year,
            "citation_count": p.citation_count
        } for p in sorted(pubs, key=lambda x: x.publication_year or 0, reverse=True)[:5]
    ]

    return {
        "researcher_id": researcher_id,
        "full_name": researcher.full_name,
        "publications": len(all_pub_ids),
        "projects": db.query(ProjectAssignment).filter(
            ProjectAssignment.researcher_id == researcher_id
        ).count(),
        "conferences": db.query(ConferenceParticipation).filter(
            ConferenceParticipation.researcher_id == researcher_id
        ).count(),
        "collaborations": db.query(PublicationAuthor).filter(
            PublicationAuthor.researcher_id == researcher_id
        ).count(),
        "citation_summary": total_citations,
        "recent_publications": recent_pubs
    }


@router.get("/institution/{institution_id}")
def institution_dashboard_by_id(institution_id: int, db: Session = Depends(get_db)):
    inst = db.query(Institution).filter(Institution.id == institution_id).first()
    if not inst:
        raise HTTPException(status_code=404, detail="Institution not found")

    researchers = db.query(Researcher).filter(Researcher.institution == inst.name).all()
    departments = sorted(list({r.department for r in researchers if r.department}))

    researcher_ids = [r.id for r in researchers]
    publication_count = db.query(Publication).filter(
        Publication.researcher_id.in_(researcher_ids)
    ).count() if researcher_ids else 0

    recent_pubs = db.query(Publication).filter(
        Publication.researcher_id.in_(researcher_ids)
    ).order_by(Publication.id.desc()).limit(5).all() if researcher_ids else []

    return {
        "institution_id": institution_id,
        "institution_name": inst.name,
        "departments": len(departments),
        "department_list": departments,
        "researchers": len(researchers),
        "publications": publication_count,
        "projects": db.query(ResearchProject).filter(
            ResearchProject.institution_name == inst.name
        ).count(),
        "collaborations": db.query(PublicationAuthor).filter(
            PublicationAuthor.researcher_id.in_(researcher_ids)
        ).count() if researcher_ids else 0,
        "recent_publications": [
            {
                "id": p.id,
                "title": p.title,
                "authors": p.authors,
                "publication_year": p.publication_year
            } for p in recent_pubs
        ]
    }