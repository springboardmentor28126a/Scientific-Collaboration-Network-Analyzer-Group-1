from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.backend.database.database import get_db
# from app.backend.models.collaboration import Collaboration, PublicationAuthor
# from app.backend.models.conference import Conference, ConferenceParticipation
from app.backend.models.institution import Institution
# from app.backend.models.project import ProjectAssignment, ResearchProject
# from app.backend.models.publication import Publication
from app.backend.models.researcher import Researcher
from app.backend.models.user import User

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/admin")
def admin_dashboard(db: Session = Depends(get_db)):
    return {
        "users": db.query(User).count(),
        "researchers": db.query(Researcher).count(),
        "institutions": db.query(Institution).count(),
        # "publications": db.query(Publication).count(),
        # "projects": db.query(ResearchProject).count(),
        # "conferences": db.query(Conference).count(),
        # "collaborations": db.query(Collaboration).count(),
    }


@router.get("/researcher/{researcher_id}")
def researcher_dashboard(researcher_id: int, db: Session = Depends(get_db)):
    return {
        "researcher_id": researcher_id,
        "publications": db.query(PublicationAuthor).filter(
            PublicationAuthor.researcher_id == researcher_id
        ).count(),
        "projects": db.query(ProjectAssignment).filter(
            ProjectAssignment.researcher_id == researcher_id
        ).count(),
        "conferences": db.query(ConferenceParticipation).filter(
            ConferenceParticipation.researcher_id == researcher_id
        ).count(),
        "collaborations": db.query(Collaboration).filter(
            (Collaboration.primary_researcher_id == researcher_id)
            | (Collaboration.partner_researcher_id == researcher_id)
        ).count(),
    }


@router.get("/institution/{institution_name}")
def institution_dashboard(institution_name: str, db: Session = Depends(get_db)):
    return {
        "institution": institution_name,
        "researchers": db.query(Researcher).filter(
            Researcher.institution == institution_name
        ).count(),
        "projects": db.query(ResearchProject).filter(
            ResearchProject.institution_name == institution_name
        ).count(),
        "collaborations": db.query(Collaboration).filter(
            Collaboration.institution_name == institution_name
        ).count(),
    }