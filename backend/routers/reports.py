import csv
import io
from datetime import date, datetime

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from backend.database.database import get_db
from backend.database.models import Institution, Publication, User
from backend.models.friend_request import FriendRequest
from backend.utils.dependencies import require_verified_user

router = APIRouter(prefix="/reports", tags=["Reports"])
REPORT_TYPES = {"researcher", "publication", "review", "institution", "collaboration", "system"}
ROLE_REPORTS = {
    "Researcher": {"researcher", "publication", "collaboration"},
    "Reviewer": {"researcher", "publication", "review", "institution", "collaboration"},
    "Institution Admin": {"researcher", "publication", "institution"},
    "System Admin": REPORT_TYPES,
}


def _allowed_publications(current_user: User, db: Session):
    query = db.query(Publication)
    if current_user.role == "System Admin" or current_user.role == "Reviewer":
        return query
    if current_user.role == "Institution Admin":
        return query.filter(Publication.institution_id == current_user.institution_id)
    return query.filter(Publication.researcher_id == current_user.id)


def _allowed_users(current_user: User, db: Session):
    query = db.query(User)
    if current_user.role == "System Admin" or current_user.role == "Reviewer":
        return query
    if current_user.role == "Institution Admin":
        return query.filter(User.institution_id == current_user.institution_id)
    return query.filter(User.id == current_user.id)


def _rows(report_type: str, current_user: User, db: Session, date_from: date | None, date_to: date | None, status: str | None, institution_id: int | None, researcher_id: int | None):
    publications = _allowed_publications(current_user, db)
    if date_from:
        publications = publications.filter(func.date(Publication.uploaded_at) >= date_from)
    if date_to:
        publications = publications.filter(func.date(Publication.uploaded_at) <= date_to)
    if status:
        publications = publications.filter(Publication.status == status)
    if institution_id:
        publications = publications.filter(Publication.institution_id == institution_id)
    if researcher_id:
        if current_user.role == "Researcher" and researcher_id != current_user.id:
            raise HTTPException(status_code=403, detail="You may only report on your own records.")
        publications = publications.filter(Publication.researcher_id == researcher_id)

    if report_type == "publication":
        return [
            [p.id, p.title, p.authors, p.publication_year or "", p.uploaded_at or "", p.status, p.researcher_id, p.institution_id or ""]
            for p in publications.order_by(Publication.uploaded_at.desc()).all()
        ], ["Publication ID", "Title", "Authors", "Publication Year", "Uploaded At", "Status", "Researcher ID", "Institution ID"]

    if report_type == "review":
        if current_user.role not in {"System Admin", "Reviewer", "Institution Admin", "Researcher"}:
            raise HTTPException(status_code=403, detail="Report access denied.")
        reviewed = publications.filter(or_(Publication.selected_reviewer_id == current_user.id, Publication.reviewed_by == current_user.id)) if current_user.role == "Reviewer" else publications
        return [[p.id, p.title, p.selected_reviewer_id or "", p.reviewed_by or "", p.status, p.reviewed_at or "", p.review_comments or ""] for p in reviewed.order_by(Publication.reviewed_at.desc()).all()], ["Publication ID", "Title", "Assigned Reviewer ID", "Completed By ID", "Status", "Reviewed At", "Review Comments"]

    if report_type == "researcher":
        users = _allowed_users(current_user, db).filter(User.role == "Researcher").order_by(User.name).all()
        counts = dict(db.query(Publication.researcher_id, func.count(Publication.id)).group_by(Publication.researcher_id).all())
        return [[u.id, u.name, u.country or "", u.institution_name or "", u.research_interests or "", counts.get(u.id, 0)] for u in users], ["Researcher ID", "Name", "Country", "Institution", "Research Interests", "Publication Count"]

    if report_type == "institution":
        institutions = db.query(Institution).order_by(Institution.name)
        if current_user.role == "Institution Admin":
            institutions = institutions.filter(Institution.id == current_user.institution_id)
        institutions = institutions.all()
        researcher_counts = dict(db.query(User.institution_id, func.count(User.id)).filter(User.role == "Researcher").group_by(User.institution_id).all())
        publication_counts = dict(db.query(Publication.institution_id, func.count(Publication.id)).group_by(Publication.institution_id).all())
        return [[i.id, i.name, i.country or "", researcher_counts.get(i.id, 0), publication_counts.get(i.id, 0)] for i in institutions], ["Institution ID", "Name", "Country", "Researcher Count", "Publication Count"]

    if report_type == "collaboration":
        collaborations = db.query(FriendRequest).filter(FriendRequest.status == "Accepted")
        if current_user.role == "Researcher":
            collaborations = collaborations.filter(or_(FriendRequest.sender_id == current_user.id, FriendRequest.receiver_id == current_user.id))
        items = collaborations.order_by(FriendRequest.created_at.desc()).all()
        users = {u.id: u.name for u in db.query(User).filter(User.id.in_({x.sender_id for x in items} | {x.receiver_id for x in items})).all()} if items else {}
        return [[x.id, users.get(x.sender_id, ""), users.get(x.receiver_id, ""), x.status, x.created_at or ""] for x in items], ["Collaboration ID", "Researcher", "Collaborator", "Status", "Created At"]

    if report_type == "system" and current_user.role != "System Admin":
        raise HTTPException(status_code=403, detail="Only the System Admin can generate system reports.")
    return [[role, db.query(User).filter(User.role == role).count()] for role in ["Researcher", "Reviewer", "Institution Admin", "System Admin"]], ["Role", "User Count"]


@router.get("/csv")
def download_report(
    report_type: str = Query(...),
    date_from: date | None = Query(None),
    date_to: date | None = Query(None),
    status: str | None = Query(None),
    institution_id: int | None = Query(None),
    researcher_id: int | None = Query(None),
    current_user: User = Depends(require_verified_user),
    db: Session = Depends(get_db),
):
    if report_type not in REPORT_TYPES:
        raise HTTPException(status_code=400, detail="Unsupported report type.")
    if report_type not in ROLE_REPORTS.get(current_user.role, set()):
        raise HTTPException(status_code=403, detail="You are not authorized to generate this report.")
    if date_from and date_to and date_from > date_to:
        raise HTTPException(status_code=400, detail="The report start date must be before the end date.")
    rows, headers = _rows(report_type, current_user, db, date_from, date_to, status, institution_id, researcher_id)
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([f"SCNA {report_type.title()} Report"])
    writer.writerow(["Generated", datetime.utcnow().isoformat(timespec="seconds") + "Z"])
    writer.writerow([])
    writer.writerow(headers)
    writer.writerows(rows)
    response = StreamingResponse(iter([output.getvalue()]), media_type="text/csv")
    response.headers["Content-Disposition"] = f'attachment; filename="scna-{report_type}-report.csv"'
    return response
