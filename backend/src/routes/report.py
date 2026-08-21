from fastapi import APIRouter, Depends, Query, Response, HTTPException
from sqlalchemy.orm import Session

from database import get_db

from schemas.report import (
    PublicationReportOut,
    ResearchReportOut,
    CollaborationReportOut,
    InstitutionReportOut,
    SavedReportCreate,
    SavedReportOut,
)

from services import report, audit

from middleware.auth import get_current_user

from models.user import User


router = APIRouter(
    prefix="/reports",
    tags=["Reports & Export"]
)


# =========================================================
# PUBLICATION REPORT
# =========================================================

@router.get(
    "/publications",
    response_model=PublicationReportOut
)
def get_publication_report(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    return report.get_publication_report(db)


# =========================================================
# RESEARCHER REPORT
# =========================================================

@router.get(
    "/researchers",
    response_model=ResearchReportOut
)
def get_researcher_report(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    return report.get_research_report(db)


# =========================================================
# COLLABORATION REPORT
# =========================================================

@router.get(
    "/collaborations",
    response_model=CollaborationReportOut
)
def get_collaboration_report(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    return report.get_collaboration_report(db)


# =========================================================
# INSTITUTION REPORT
# =========================================================

@router.get(
    "/institutions",
    response_model=InstitutionReportOut
)
def get_institution_report(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    return report.get_institution_report(db)


# =========================================================
# CSV EXPORT
# =========================================================

@router.get("/export/csv")
def export_csv(
    report_type: str = Query(
        ...,
        description=(
            "publications, researchers, "
            "collaborations, institutions"
        )
    ),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    allowed_types = [
        "publications",
        "researchers",
        "collaborations",
        "institutions",
    ]

    if report_type not in allowed_types:

        raise HTTPException(
            status_code=400,
            detail="Invalid report type."
        )

    csv_data = report.generate_csv_export(
        db,
        report_type
    )

    audit.log_action(
        db,
        current_user.id,
        "EXPORT_CSV",
        "reports",
        None,
        f"Exported CSV report for {report_type}"
    )

    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={
            "Content-Disposition":
                f"attachment; "
                f"filename={report_type}_report.csv"
        }
    )


# =========================================================
# REAL PDF EXPORT
# =========================================================

@router.get("/export/pdf")
def export_pdf(
    report_type: str = Query(
        ...,
        description=(
            "publications, researchers, "
            "collaborations, institutions"
        )
    ),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    allowed_types = [
        "publications",
        "researchers",
        "collaborations",
        "institutions",
    ]

    if report_type not in allowed_types:

        raise HTTPException(
            status_code=400,
            detail="Invalid report type."
        )

    pdf_data = report.generate_pdf_export(
        db,
        report_type
    )

    audit.log_action(
        db,
        current_user.id,
        "EXPORT_PDF",
        "reports",
        None,
        f"Exported PDF report for {report_type}"
    )

    return Response(
        content=pdf_data,
        media_type="application/pdf",
        headers={
            "Content-Disposition":
                f"attachment; "
                f"filename={report_type}_report.pdf"
        }
    )


# =========================================================
# CREATE SAVED REPORT
# =========================================================

@router.post(
    "/saved",
    response_model=SavedReportOut
)
def create_saved_report(
    data: SavedReportCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    rep = report.create_saved_report(
        db,
        data,
        current_user.id
    )

    audit.log_action(
        db,
        current_user.id,
        "CREATE_SAVED_REPORT",
        "saved_reports",
        rep.id,
        f"Saved report configuration: {rep.title}"
    )

    return rep


# =========================================================
# GET SAVED REPORTS
# =========================================================

@router.get(
    "/saved",
    response_model=list[SavedReportOut]
)
def get_saved_reports(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    return report.get_saved_reports(db)


# =========================================================
# UPDATE SAVED REPORT
# =========================================================

@router.put(
    "/saved/{report_id}",
    response_model=SavedReportOut
)
def update_saved_report(
    report_id: int,
    data: SavedReportCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    rep = report.update_saved_report(
        db,
        report_id,
        data
    )

    if not rep:

        raise HTTPException(
            status_code=404,
            detail="Saved report not found."
        )

    audit.log_action(
        db,
        current_user.id,
        "UPDATE_SAVED_REPORT",
        "saved_reports",
        rep.id,
        f"Updated saved report configuration: {rep.title}"
    )

    return rep


# =========================================================
# DELETE SAVED REPORT
# =========================================================

@router.delete(
    "/saved/{report_id}"
)
def delete_saved_report(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    rep = report.delete_saved_report(
        db,
        report_id
    )

    if not rep:

        raise HTTPException(
            status_code=404,
            detail="Saved report not found."
        )

    audit.log_action(
        db,
        current_user.id,
        "DELETE_SAVED_REPORT",
        "saved_reports",
        rep.id,
        f"Deleted saved report configuration: {rep.title}"
    )

    return {
        "message": "Saved report deleted successfully."
    }