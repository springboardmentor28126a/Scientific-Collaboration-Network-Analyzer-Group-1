from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.backend.database.database import get_db
from app.backend.models.collaboration import Collaboration
from app.backend.models.project import ResearchProject
from app.backend.models.publication import Publication
from app.backend.models.researcher import Researcher

router = APIRouter(prefix="/reports", tags=["Reports"])


@router.get("/publications")
def publication_report(db: Session = Depends(get_db)):
    by_status = db.query(Publication.status, func.count(Publication.id)).group_by(
        Publication.status
    ).all()
    by_year = db.query(Publication.publication_year, func.count(Publication.id)).group_by(
        Publication.publication_year
    ).all()

    return {
        "total": db.query(Publication).count(),
        "by_status": dict(by_status),
        "by_year": dict(by_year),
    }


@router.get("/research")
def research_report(db: Session = Depends(get_db)):
    return {
        "researchers": db.query(Researcher).count(),
        "active_projects": db.query(ResearchProject).filter(
            ResearchProject.status == "Active"
        ).count(),
        "published_publications": db.query(Publication).filter(
            Publication.status == "Published"
        ).count(),
    }


@router.get("/collaborations")
def collaboration_report(db: Session = Depends(get_db)):
    by_status = db.query(Collaboration.status, func.count(Collaboration.id)).group_by(
        Collaboration.status
    ).all()
    by_type = db.query(
        Collaboration.collaboration_type,
        func.count(Collaboration.id),
    ).group_by(Collaboration.collaboration_type).all()

    return {
        "total": db.query(Collaboration).count(),
        "by_status": dict(by_status),
        "by_type": dict(by_type),
    }
