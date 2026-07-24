from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database.database import get_db
from app.models.researcher import Researcher
from app.models.publication import Publication
from app.models.project import ResearchProject
from app.models.collaboration import Collaboration

router = APIRouter(
    prefix="/reports",
    tags=["Reports"]
)


# ------------------------------------------------------------------
# Existing Publication Report
# ------------------------------------------------------------------

@router.get("/publications")
def publication_report(db: Session = Depends(get_db)):

    by_status = (
        db.query(
            Publication.status,
            func.count(Publication.id)
        )
        .group_by(Publication.status)
        .all()
    )

    by_year = (
        db.query(
            Publication.publication_year,
            func.count(Publication.id)
        )
        .group_by(Publication.publication_year)
        .order_by(Publication.publication_year)
        .all()
    )

    return {
        "total": db.query(Publication).count(),
        "by_status": dict(by_status),
        "by_year": dict(by_year)
    }


# ------------------------------------------------------------------
# Existing Research Report
# ------------------------------------------------------------------

@router.get("/research")
def research_report(db: Session = Depends(get_db)):

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


# ------------------------------------------------------------------
# Existing Collaboration Report
# ------------------------------------------------------------------

@router.get("/collaborations")
def collaboration_report(db: Session = Depends(get_db)):

    by_status = (
        db.query(
            Collaboration.status,
            func.count(Collaboration.id)
        )
        .group_by(Collaboration.status)
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

        "by_status":
            dict(by_status),

        "by_type":
            dict(by_type)

    }


# ------------------------------------------------------------------
# Dashboard API
# ------------------------------------------------------------------

@router.get("/dashboard")
def dashboard_report(db: Session = Depends(get_db)):

    # ---------------- Summary ----------------

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

    # ---------------- Publications by Year ----------------

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

    # ---------------- Publications by Status ----------------

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

        status_labels.append(status)
        status_values.append(total)

    # ---------------- Researchers by Institution ----------------

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

    # ---------------- Top Institutions ----------------

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

    return {

        # Summary Cards

        "summary": {

            "researchers":
                researcher_count,

            "publications":
                publication_count,

            "projects":
                project_count,

            "collaborations":
                collaboration_count

        },

        # Publications by Year

        "publication_year": {

            "labels":
                year_labels,

            "values":
                year_values

        },

        # Publications by Status

        "publication_status": {

            "labels":
                status_labels,

            "values":
                status_values

        },

        # Institution Chart

        "institution": {

            "labels":
                institution_labels,

            "values":
                institution_values

        },

        # Table

        "top_institutions":
            top_institutions

    }
