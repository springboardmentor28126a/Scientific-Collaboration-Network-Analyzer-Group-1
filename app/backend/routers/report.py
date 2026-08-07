from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session
from sqlalchemy import func
import csv
import io

from app.backend.database.database import get_db
from app.backend.models.researcher import Researcher
from app.backend.models.publication import Publication
from app.backend.models.project import ResearchProject
from app.backend.models.collaboration import Collaboration, PublicationAuthor

from app.backend.utils.permissions import require_role, get_current_user

router = APIRouter(
    prefix="/reports",
    tags=["Reports"],
    dependencies=[
        Depends(get_current_user)
    ]
)


@router.get("/export/excel")
def export_excel_report(db: Session = Depends(get_db)):
    """Export system research and publication statistics as an Excel-compatible CSV file."""
    output = io.StringIO()
    writer = csv.writer(output)

    # Header
    writer.writerow(["SCNA Research and Publication Report"])
    writer.writerow([])

    # Publications section
    writer.writerow(["ID", "Title", "Authors", "Type", "Name", "Year", "Citation Count", "Status"])
    publications = db.query(Publication).all()
    for p in publications:
        writer.writerow([
            p.id,
            p.title,
            p.authors,
            p.publication_type,
            p.publication_name,
            p.publication_year or "",
            p.citation_count or 0,
            p.status
        ])

    writer.writerow([])
    writer.writerow(["Researchers Summary"])
    writer.writerow(["ID", "Full Name", "Department", "Institution", "Research Interest"])
    researchers = db.query(Researcher).all()
    for r in researchers:
        writer.writerow([
            r.id,
            r.full_name,
            r.department or "",
            r.institution or "",
            r.research_interest or ""
        ])

    csv_data = output.getvalue()
    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={
            "Content-Disposition": "attachment; filename=scna_research_report.csv"
        }
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
        PublicationAuthor
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

        institution_name = institution if institution else "Unknown"

        researcher_ids = [
            r.id for r in db.query(Researcher.id).filter(
                Researcher.institution == institution
            ).all()
        ]

        pub_count = (
            db.query(Publication)
            .filter(Publication.researcher_id.in_(researcher_ids))
            .count()
            if researcher_ids else 0
        )

        collab_count = (
            db.query(PublicationAuthor)
            .filter(PublicationAuthor.researcher_id.in_(researcher_ids))
            .count()
            if researcher_ids else 0
        )

        top_institutions.append({

            "institution":
                institution_name,

            "researchers":
                total,

            "publications":
                pub_count,

            "collaborations":
                collab_count

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



# ---------------------------------------------------------------------------
# Additive per-module CSV downloads (Researchers, Publications,
# Collaborations, Institutions). Same CSV pattern as export_excel_report
# above. No PDF library exists in this project's dependencies today, so
# only CSV is implemented, consistent with how export/excel already works.
# ---------------------------------------------------------------------------

@router.get("/download/researchers")
def download_researchers_report(db: Session = Depends(get_db)):
    """Download all researcher records as CSV."""
    output = io.StringIO()
    writer = csv.writer(output)

    writer.writerow(["ID", "Full Name", "Department", "Institution", "Research Interest", "Skills", "Affiliations"])
    for r in db.query(Researcher).all():
        writer.writerow([
            r.id, r.full_name, r.department or "", r.institution or "",
            r.research_interest or "", r.skills or "", r.affiliations or ""
        ])

    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=scna_researchers.csv"}
    )


@router.get("/download/publications")
def download_publications_report(db: Session = Depends(get_db)):
    """Download all publication records as CSV."""
    output = io.StringIO()
    writer = csv.writer(output)

    writer.writerow(["ID", "Title", "Authors", "Type", "Publication Name", "Year", "DOI", "Citation Count", "Status"])
    for p in db.query(Publication).all():
        writer.writerow([
            p.id, p.title, p.authors, p.publication_type, p.publication_name,
            p.publication_year or "", p.doi or "", p.citation_count or 0, p.status
        ])

    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=scna_publications.csv"}
    )


@router.get("/download/collaborations")
def download_collaborations_report(db: Session = Depends(get_db)):
    """
    Download collaboration (co-authorship) records as CSV.

    Exports PublicationAuthor rows rather than the separate Collaboration
    table: the "Add Collaboration" UI action writes to PublicationAuthor,
    so that's what reflects real collaboration activity (the Collaboration
    table is otherwise unused, and would produce an effectively empty
    export).
    """
    output = io.StringIO()
    writer = csv.writer(output)

    writer.writerow(["ID", "Publication", "Researcher", "Author Order", "Contribution"])

    for pa in db.query(PublicationAuthor).all():
        publication = db.query(Publication).filter(Publication.id == pa.publication_id).first()
        researcher = db.query(Researcher).filter(Researcher.id == pa.researcher_id).first()

        writer.writerow([
            pa.id,
            publication.title if publication else f"Publication #{pa.publication_id}",
            researcher.full_name if researcher else f"Researcher #{pa.researcher_id}",
            pa.author_order or "",
            pa.contribution or ""
        ])

    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=scna_collaborations.csv"}
    )


@router.get("/download/institutions")
def download_institutions_report(db: Session = Depends(get_db)):
    """Download all institution records as CSV."""
    from app.backend.models.institution import Institution

    output = io.StringIO()
    writer = csv.writer(output)

    writer.writerow(["ID", "Name", "Type", "Country", "City", "Website", "Contact Email"])
    for i in db.query(Institution).all():
        writer.writerow([
            i.id, i.name, i.institution_type or "", i.country or "",
            i.city or "", i.website or "", i.contact_email or ""
        ])

    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=scna_institutions.csv"}
    )
