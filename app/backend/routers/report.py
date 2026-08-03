from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.backend.database.database import get_db

from app.backend.models.user import User
from app.backend.models.researcher import Researcher
from app.backend.models.publication import Publication
from app.backend.models.project import ResearchProject
from app.backend.models.collaboration import Collaboration
from app.backend.models.conference import Conference

from app.backend.utils.rbac import get_current_user

router = APIRouter(
    prefix="/reports",
    tags=["Reports"]
)


# ---------------------------------------------------------
# Publication Report
# ---------------------------------------------------------

@router.get(
    "/publications",
    summary="Publication Report"
)
def publication_report(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    if current_user.role not in [
        "system_admin",
        "institution_admin"
    ]:
        raise HTTPException(
            status_code=403,
            detail="Permission denied."
        )

    by_status = (
        db.query(
            Publication.status,
            func.count(Publication.id)
        )
        .group_by(
            Publication.status
        )
        .all()
    )

    by_year = (
        db.query(
            Publication.publication_year,
            func.count(Publication.id)
        )
        .group_by(
            Publication.publication_year
        )
        .order_by(
            Publication.publication_year
        )
        .all()
    )

    return {

        "total":
            db.query(Publication).count(),

        "by_status": {
            status if status else "Unknown": total
            for status, total in by_status
        },

        "by_year": {
            year: total
            for year, total in by_year
            if year is not None
        }

    }


# ---------------------------------------------------------
# Research Report
# ---------------------------------------------------------

@router.get(
    "/research",
    summary="Research Report"
)
def research_report(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    if current_user.role not in [
        "system_admin",
        "institution_admin"
    ]:
        raise HTTPException(
            status_code=403,
            detail="Permission denied."
        )

    return {

        "researchers":
            db.query(Researcher).count(),

        "projects":
            db.query(ResearchProject).count(),

        "active_projects":
            db.query(ResearchProject)
            .filter(
                ResearchProject.status == "Active"
            )
            .count(),

        "published_publications":
            db.query(Publication)
            .filter(
                Publication.status == "Published"
            )
            .count()

    }


# ---------------------------------------------------------
# Collaboration Report
# ---------------------------------------------------------

@router.get(
    "/collaborations",
    summary="Collaboration Report"
)
def collaboration_report(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    if current_user.role not in [
        "system_admin",
        "institution_admin"
    ]:
        raise HTTPException(
            status_code=403,
            detail="Permission denied."
        )

    by_status = (
        db.query(
            Collaboration.status,
            func.count(Collaboration.id)
        )
        .group_by(
            Collaboration.status
        )
        .all()
    )

    by_type = (
        db.query(
            Collaboration.collaboration_type,
            func.count(Collaboration.id)
        )
        .group_by(
            Collaboration.collaboration_type
        )
        .all()
    )

    return {

        "total":
            db.query(Collaboration).count(),

        "by_status": {
            status if status else "Unknown": total
            for status, total in by_status
        },

        "by_type": {
            collab_type if collab_type else "Unknown": total
            for collab_type, total in by_type
        }

    }


# ---------------------------------------------------------
# Project Report
# ---------------------------------------------------------

@router.get(
    "/projects",
    summary="Project Report"
)
def project_report(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    if current_user.role not in [
        "system_admin",
        "institution_admin"
    ]:
        raise HTTPException(
            status_code=403,
            detail="Permission denied."
        )

    by_status = (
        db.query(
            ResearchProject.status,
            func.count(
                ResearchProject.id
            )
        )
        .group_by(
            ResearchProject.status
        )
        .all()
    )

    return {

        "total":
            db.query(
                ResearchProject
            ).count(),

        "by_status": {
            status if status else "Unknown": total
            for status, total in by_status
        }

    }


# ---------------------------------------------------------
# Conference Report
# ---------------------------------------------------------

@router.get(
    "/conferences",
    summary="Conference Report"
)
def conference_report(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    if current_user.role not in [
        "system_admin",
        "institution_admin"
    ]:
        raise HTTPException(
            status_code=403,
            detail="Permission denied."
        )

    return {

        "total_conferences":
            db.query(
                Conference
            ).count()

    }

# ---------------------------------------------------------
# Dashboard Report
# ---------------------------------------------------------

@router.get(
    "/dashboard",
    summary="Dashboard Report"
)
def dashboard_report(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    if current_user.role not in [
        "system_admin",
        "institution_admin"
    ]:
        raise HTTPException(
            status_code=403,
            detail="Permission denied."
        )

    # -----------------------------------------------------
    # Summary Cards
    # -----------------------------------------------------

    researcher_count = db.query(
        Researcher
    ).count()

    publication_count = db.query(
        Publication
    ).count()

    project_count = db.query(
        ResearchProject
    ).count()

    collaboration_count = db.query(
        Collaboration
    ).count()

    conference_count = db.query(
        Conference
    ).count()

    # -----------------------------------------------------
    # Publications by Year
    # -----------------------------------------------------

    publication_year = (
        db.query(
            Publication.publication_year,
            func.count(Publication.id)
        )
        .group_by(
            Publication.publication_year
        )
        .order_by(
            Publication.publication_year
        )
        .all()
    )

    year_labels = []
    year_values = []

    for year, total in publication_year:

        if year is None:
            continue

        year_labels.append(str(year))
        year_values.append(total)

    # -----------------------------------------------------
    # Publications by Status
    # -----------------------------------------------------

    publication_status = (
        db.query(
            Publication.status,
            func.count(Publication.id)
        )
        .group_by(
            Publication.status
        )
        .all()
    )

    status_labels = []
    status_values = []

    for status, total in publication_status:

        status_labels.append(
            status if status else "Unknown"
        )

        status_values.append(total)

    # -----------------------------------------------------
    # Researchers by Institution
    # -----------------------------------------------------

    institution_data = (
        db.query(
            Researcher.institution,
            func.count(Researcher.id)
        )
        .group_by(
            Researcher.institution
        )
        .all()
    )

    institution_labels = []
    institution_values = []

    for institution, total in institution_data:

        institution_labels.append(
            institution if institution else "Unknown"
        )

        institution_values.append(total)

    # -----------------------------------------------------
    # Top Institutions
    # -----------------------------------------------------

    top_institutions = []

    for institution, total in sorted(
        institution_data,
        key=lambda x: x[1],
        reverse=True
    ):

        top_institutions.append({

            "institution":
                institution if institution else "Unknown",

            "researchers":
                total

        })

    # -----------------------------------------------------
    # Projects by Status
    # -----------------------------------------------------

    project_status = (
        db.query(
            ResearchProject.status,
            func.count(
                ResearchProject.id
            )
        )
        .group_by(
            ResearchProject.status
        )
        .all()
    )

    project_status_labels = []
    project_status_values = []

    for status, total in project_status:

        project_status_labels.append(
            status if status else "Unknown"
        )

        project_status_values.append(total)

    # -----------------------------------------------------
    # Collaborations by Type
    # -----------------------------------------------------

    collaboration_type = (
        db.query(
            Collaboration.collaboration_type,
            func.count(
                Collaboration.id
            )
        )
        .group_by(
            Collaboration.collaboration_type
        )
        .all()
    )

    collaboration_labels = []
    collaboration_values = []

    for collab_type, total in collaboration_type:

        collaboration_labels.append(
            collab_type if collab_type else "Unknown"
        )

        collaboration_values.append(total)

    # -----------------------------------------------------
    # Final Response
    # -----------------------------------------------------

    return {

        "summary": {

            "researchers": researcher_count,
            "publications": publication_count,
            "projects": project_count,
            "collaborations": collaboration_count,
            "conferences": conference_count

        },

        "publication_year": {

            "labels": year_labels,
            "values": year_values

        },

        "publication_status": {

            "labels": status_labels,
            "values": status_values

        },

        "institution": {

            "labels": institution_labels,
            "values": institution_values

        },

        "project_status": {

            "labels": project_status_labels,
            "values": project_status_values

        },

        "collaboration_type": {

            "labels": collaboration_labels,
            "values": collaboration_values

        },

        "top_institutions": top_institutions

    }