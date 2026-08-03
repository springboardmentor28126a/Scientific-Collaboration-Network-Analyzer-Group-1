from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.backend.database.database import get_db

from app.backend.models.user import User
from app.backend.models.researcher import Researcher
from app.backend.models.institution import Institution
from app.backend.models.publication import Publication
from app.backend.models.project import (
    ResearchProject,
    ProjectAssignment
)
from app.backend.models.conference import (
    Conference,
    ConferenceParticipation
)
from app.backend.models.collaboration import (
    Collaboration,
    PublicationAuthor
)

from app.backend.utils.rbac import get_current_user

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"]
)

# ---------------------------------------------------------
# Admin Dashboard
# ---------------------------------------------------------

@router.get(
    "/admin",
    summary="Admin Dashboard"
)
def admin_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    if current_user.role != "system_admin":
        raise HTTPException(
            status_code=403,
            detail="Permission denied."
        )

    return {

        "total_users":
            db.query(User).count(),

        "total_researchers":
            db.query(Researcher).count(),

        "total_institutions":
            db.query(Institution).count(),

        "total_publications":
            db.query(Publication).count(),

        "total_projects":
            db.query(ResearchProject).count(),

        "total_conferences":
            db.query(Conference).count(),

        "total_collaborations":
            db.query(Collaboration).count()

    }


# ---------------------------------------------------------
# Researcher Dashboard
# ---------------------------------------------------------

@router.get(
    "/researcher/{researcher_id}",
    summary="Researcher Dashboard"
)
def researcher_dashboard(
    researcher_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    researcher = (
        db.query(Researcher)
        .filter(
            Researcher.id == researcher_id
        )
        .first()
    )

    if not researcher:
        raise HTTPException(
            status_code=404,
            detail="Researcher not found."
        )

    dashboard = {

        "researcher_id":
            researcher.id,

        "researcher_name":
            researcher.full_name,

        "institution":
            researcher.institution,

        "publications":
            db.query(PublicationAuthor)
            .filter(
                PublicationAuthor.researcher_id == researcher.id
            )
            .count(),

        "projects":
            db.query(ProjectAssignment)
            .filter(
                ProjectAssignment.researcher_id == researcher.id
            )
            .count(),

        "conferences":
            db.query(ConferenceParticipation)
            .filter(
                ConferenceParticipation.researcher_id == researcher.id
            )
            .count(),

        "collaborations":
            db.query(Collaboration)
            .filter(
                (Collaboration.primary_researcher_id == researcher.id)
                |
                (Collaboration.partner_researcher_id == researcher.id)
            )
            .count()

    }

    return dashboard

# ---------------------------------------------------------
# Institution Dashboard
# ---------------------------------------------------------

@router.get(
    "/institution/{institution_name}",
    summary="Institution Dashboard"
)
def institution_dashboard(
    institution_name: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    institution = (
        db.query(Institution)
        .filter(
            Institution.name == institution_name
        )
        .first()
    )

    if not institution:
        raise HTTPException(
            status_code=404,
            detail="Institution not found."
        )

    dashboard = {

        "institution":
            institution.name,

        "researchers":
            db.query(Researcher)
            .filter(
                Researcher.institution == institution.name
            )
            .count(),

        "publications":
            db.query(Publication)
            .join(
                Researcher,
                Publication.researcher_id == Researcher.id
            )
            .filter(
                Researcher.institution == institution.name
            )
            .count(),

        "projects":
            db.query(ResearchProject)
            .filter(
                ResearchProject.institution_name == institution.name
            )
            .count(),

        "conferences":
            db.query(ConferenceParticipation)
            .join(
                Researcher,
                ConferenceParticipation.researcher_id == Researcher.id
            )
            .filter(
                Researcher.institution == institution.name
            )
            .count(),

        "collaborations":
            db.query(Collaboration)
            .filter(
                Collaboration.institution_name == institution.name
            )
            .count()

    }

    return dashboard


# ---------------------------------------------------------
# Dashboard Summary
# ---------------------------------------------------------

@router.get(
    "/summary",
    summary="Dashboard Summary"
)
def dashboard_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    return {

        "summary": {

            "users":
                db.query(User).count(),

            "researchers":
                db.query(Researcher).count(),

            "institutions":
                db.query(Institution).count(),

            "publications":
                db.query(Publication).count(),

            "projects":
                db.query(ResearchProject).count(),

            "conferences":
                db.query(Conference).count(),

            "collaborations":
                db.query(Collaboration).count()

        },

        "publication_statistics": {

            "published":
                db.query(Publication)
                .filter(
                    Publication.status == "Published"
                )
                .count(),

            "draft":
                db.query(Publication)
                .filter(
                    Publication.status == "Draft"
                )
                .count()

        },

        "project_statistics": {

            "active":
                db.query(ResearchProject)
                .filter(
                    ResearchProject.status == "Active"
                )
                .count(),

            "completed":
                db.query(ResearchProject)
                .filter(
                    ResearchProject.status == "Completed"
                )
                .count()

        },

        "conference_statistics": {

            "total":
                db.query(Conference).count(),

            "participations":
                db.query(
                    ConferenceParticipation
                ).count()

        },

        "collaboration_statistics": {

            "total":
                db.query(Collaboration).count()

        }

    }