from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.researcher import Researcher
from app.models.institution import Institution
from app.models.department import Department
from app.models.publication import Publication
from app.models.citation import Citation
from app.models.conference import Conference
from app.models.conference_registration import ConferenceRegistration
from app.utils.constants import UserRole


def researcher_report(db: Session, institution_id: Optional[int], department_id: Optional[int], current_user):
    pub_count_sq = (
        db.query(Publication.owner_researcher_id, func.count(Publication.id).label("pub_count"))
        .group_by(Publication.owner_researcher_id)
        .subquery()
    )
    cit_count_sq = (
        db.query(Publication.owner_researcher_id, func.count(Citation.id).label("cit_count"))
        .join(Citation, Citation.publication_id == Publication.id)
        .group_by(Publication.owner_researcher_id)
        .subquery()
    )

    query = (
        db.query(
            Researcher,
            Institution.institution_name,
            Department.department_name,
            func.coalesce(pub_count_sq.c.pub_count, 0).label("pub_count"),
            func.coalesce(cit_count_sq.c.cit_count, 0).label("cit_count"),
        )
        .join(Institution, Institution.id == Researcher.institution_id)
        .join(Department, Department.id == Researcher.department_id)
        .outerjoin(pub_count_sq, pub_count_sq.c.owner_researcher_id == Researcher.id)
        .outerjoin(cit_count_sq, cit_count_sq.c.owner_researcher_id == Researcher.id)
    )

    if current_user.role == UserRole.INSTITUTION_ADMIN.value:
        query = query.filter(Researcher.institution_id == current_user.institution_id)
    elif institution_id:
        query = query.filter(Researcher.institution_id == institution_id)

    if department_id:
        query = query.filter(Researcher.department_id == department_id)

    rows = query.all()

    return [
        {
            "researcher_id": r.id,
            "first_name": r.first_name,
            "last_name": r.last_name,
            "institution_name": inst_name,
            "department_name": dept_name,
            "publication_count": pub_count,
            "citation_count": cit_count,
        }
        for r, inst_name, dept_name, pub_count, cit_count in rows
    ]


def publication_report(
    db: Session,
    institution_id: Optional[int],
    department_id: Optional[int],
    conference_id: Optional[int],
    status: Optional[str],
    publication_type: Optional[str],
    current_user,
):
    cit_count_sq = (
        db.query(Citation.publication_id, func.count(Citation.id).label("cit_count"))
        .group_by(Citation.publication_id)
        .subquery()
    )

    query = (
        db.query(
            Publication,
            Researcher.first_name,
            Researcher.last_name,
            Institution.institution_name,
            Conference.title,
            func.coalesce(cit_count_sq.c.cit_count, 0).label("cit_count"),
        )
        .join(Researcher, Researcher.id == Publication.owner_researcher_id)
        .join(Institution, Institution.id == Researcher.institution_id)
        .outerjoin(Conference, Conference.id == Publication.conference_id)
        .outerjoin(cit_count_sq, cit_count_sq.c.publication_id == Publication.id)
    )

    if current_user.role == UserRole.INSTITUTION_ADMIN.value:
        query = query.filter(Researcher.institution_id == current_user.institution_id)
    elif institution_id:
        query = query.filter(Researcher.institution_id == institution_id)

    if department_id:
        query = query.filter(Researcher.department_id == department_id)
    if conference_id:
        query = query.filter(Publication.conference_id == conference_id)
    if status:
        query = query.filter(Publication.status == status)
    if publication_type:
        query = query.filter(Publication.publication_type == publication_type)

    rows = query.order_by(Publication.created_at.desc()).all()

    return [
        {
            "publication_id": p.id,
            "title": p.title,
            "publication_type": p.publication_type,
            "status": p.status,
            "owner_first_name": fname,
            "owner_last_name": lname,
            "institution_name": inst_name,
            "conference_title": conf_title,
            "citation_count": cit_count,
        }
        for p, fname, lname, inst_name, conf_title, cit_count in rows
    ]


def conference_report(db: Session):
    conferences = db.query(Conference).all()
    results = []
    for c in conferences:
        total = db.query(ConferenceRegistration).filter(ConferenceRegistration.conference_id == c.id).count()
        presenters = (
            db.query(ConferenceRegistration)
            .filter(ConferenceRegistration.conference_id == c.id, ConferenceRegistration.role == "PRESENTER")
            .count()
        )
        results.append({
            "conference_id": c.id,
            "title": c.title,
            "start_date": c.start_date.isoformat(),
            "end_date": c.end_date.isoformat(),
            "total_participants": total,
            "presenter_count": presenters,
            "attendee_count": total - presenters,
        })
    return results