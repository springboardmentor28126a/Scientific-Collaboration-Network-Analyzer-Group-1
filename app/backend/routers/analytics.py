from datetime import date, datetime

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.backend.database.database import get_db
from app.backend.models.publication import Publication
from app.backend.models.researcher import Researcher
from app.backend.models.audit import AuditLog
from app.backend.models.conference import ConferenceParticipation
from app.backend.utils.permissions import get_current_user

# ---------------------------------------------------------------------------
# Additive, read-only analytics endpoints for the Reports module charts.
# These do not modify or replace any existing endpoint -- they only add new
# lightweight, pre-aggregated JSON shaped for Chart.js (labels/data arrays)
# so the frontend doesn't have to pull raw record sets and aggregate them
# client-side.
#
# All endpoints require only Depends(get_current_user), matching the
# permission matrix's "Reports: View = All Logged-in Users".
# ---------------------------------------------------------------------------

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/publications-by-year")
def publications_by_year(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    rows = (
        db.query(Publication.publication_year, func.count(Publication.id))
        .filter(Publication.publication_year.isnot(None))
        .group_by(Publication.publication_year)
        .order_by(Publication.publication_year)
        .all()
    )
    return {
        "labels": [str(year) for year, _ in rows],
        "data": [count for _, count in rows],
    }


@router.get("/publications-by-status")
def publications_by_status(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    rows = (
        db.query(Publication.status, func.count(Publication.id))
        .group_by(Publication.status)
        .all()
    )
    return {
        "labels": [status or "Unknown" for status, _ in rows],
        "data": [count for _, count in rows],
    }


@router.get("/researchers-by-institution")
def researchers_by_institution(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    rows = (
        db.query(Researcher.institution, func.count(Researcher.id))
        .group_by(Researcher.institution)
        .order_by(func.count(Researcher.id).desc())
        .limit(10)
        .all()
    )
    return {
        "labels": [inst or "Unknown" for inst, _ in rows],
        "data": [count for _, count in rows],
    }


@router.get("/researchers-by-department")
def researchers_by_department(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    rows = (
        db.query(Researcher.department, func.count(Researcher.id))
        .group_by(Researcher.department)
        .order_by(func.count(Researcher.id).desc())
        .limit(10)
        .all()
    )
    return {
        "labels": [dept or "Unknown" for dept, _ in rows],
        "data": [count for _, count in rows],
    }


@router.get("/collaborations-by-year")
def collaborations_by_year(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    """
    The Collaboration table itself has no date column (schema is unchanged
    per the project's constraints), so this derives a creation year from the
    audit trail. The actual "Add Collaboration" UI action logs as
    "Add Co-Author" (it calls the publication-authors endpoint), not
    "Create Collaboration" (an endpoint the UI doesn't use) -- so that's
    the action this counts.
    """
    rows = (
        db.query(AuditLog.created_at)
        .filter(AuditLog.module == "Collaboration", AuditLog.action == "Add Co-Author")
        .all()
    )

    year_counts = {}
    for (created_at,) in rows:
        if not created_at:
            continue
        # AuditLog.created_at is declared as String, but if the live column
        # is actually a TIMESTAMP, the driver returns a datetime object
        # instead -- handle both instead of assuming string slicing works.
        if isinstance(created_at, (datetime, date)):
            year = str(created_at.year)
        else:
            year = str(created_at)[:4]
        if not year.isdigit():
            continue
        year_counts[year] = year_counts.get(year, 0) + 1

    labels = sorted(year_counts.keys())
    return {
        "labels": labels,
        "data": [year_counts[y] for y in labels],
    }


@router.get("/conference-participation")
def conference_participation(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    rows = (
        db.query(ConferenceParticipation.status, func.count(ConferenceParticipation.id))
        .group_by(ConferenceParticipation.status)
        .all()
    )
    return {
        "labels": [status or "Unknown" for status, _ in rows],
        "data": [count for _, count in rows],
    }
