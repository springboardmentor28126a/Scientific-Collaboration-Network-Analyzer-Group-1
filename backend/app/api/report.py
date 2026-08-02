from typing import Optional, List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
import csv
import io
from fastapi.responses import StreamingResponse

from app.db.database import get_db
from app.schemas.report import ResearcherReportItem, PublicationReportItem, ConferenceReportItem
from app.services.report_service import researcher_report, publication_report, conference_report
from app.core.dependencies import get_current_user, require_roles
from app.models.user import User
from app.utils.constants import UserRole

router = APIRouter(prefix="/reports", tags=["Reports"])


@router.get(
    "/researchers",
    response_model=List[ResearcherReportItem],
    dependencies=[Depends(require_roles(UserRole.SYSTEM_ADMIN.value, UserRole.INSTITUTION_ADMIN.value))],
)
def get_researcher_report(
    institution_id: Optional[int] = None,
    department_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return researcher_report(db, institution_id, department_id, current_user)


@router.get(
    "/publications",
    response_model=List[PublicationReportItem],
    dependencies=[Depends(require_roles(UserRole.SYSTEM_ADMIN.value, UserRole.INSTITUTION_ADMIN.value))],
)
def get_publication_report(
    institution_id: Optional[int] = None,
    department_id: Optional[int] = None,
    conference_id: Optional[int] = None,
    status: Optional[str] = None,
    publication_type: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return publication_report(db, institution_id, department_id, conference_id, status, publication_type, current_user)


@router.get(
    "/conferences",
    response_model=List[ConferenceReportItem],
    dependencies=[Depends(require_roles(UserRole.SYSTEM_ADMIN.value, UserRole.INSTITUTION_ADMIN.value))],
)
def get_conference_report(db: Session = Depends(get_db)):
    return conference_report(db)


@router.get(
    "/publications/export",
    dependencies=[Depends(require_roles(UserRole.SYSTEM_ADMIN.value, UserRole.INSTITUTION_ADMIN.value))],
)
def export_publication_report(
    institution_id: Optional[int] = None,
    department_id: Optional[int] = None,
    conference_id: Optional[int] = None,
    status: Optional[str] = None,
    publication_type: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    data = publication_report(db, institution_id, department_id, conference_id, status, publication_type, current_user)

    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=[
        "publication_id", "title", "publication_type", "status",
        "owner_first_name", "owner_last_name", "institution_name",
        "conference_title", "citation_count",
    ])
    writer.writeheader()
    for row in data:
        writer.writerow(row)

    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=publication_report.csv"},
    )