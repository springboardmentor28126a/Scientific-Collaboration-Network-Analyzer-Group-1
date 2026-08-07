from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func, or_
from typing import List, Dict, Any
from fastapi.responses import StreamingResponse
import io
import csv

from ..auth import get_current_user
from ..database import get_db
from ..models import User, UserRole, Publication, ResearchProject, CollaborationRequest, Institution, publication_author, ResearcherProfile, CollaborationRequestStatus

router = APIRouter(prefix="/reports", tags=["reports"])

def get_stats_base(db: Session, current_user: User):
    if current_user.role != UserRole.SYSTEM_ADMIN and current_user.role != UserRole.INSTITUTION_ADMIN:
        raise HTTPException(status_code=403, detail="Not authorized")
    institution_id = None
    if current_user.role == UserRole.INSTITUTION_ADMIN:
        institution_id = current_user.assigned_institution_id or (current_user.researcher_profile.institution_id if current_user.researcher_profile else None)
        if not institution_id:
            raise HTTPException(status_code=400, detail="Institution Admin has no assigned institution")
    return institution_id

@router.get("/publication-stats")
def publication_stats(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    institution_id = get_stats_base(db, current_user)

    pub_query = db.query(Publication)
    if institution_id:
        pub_query = pub_query.join(publication_author, publication_author.c.publication_id == Publication.id)\
                             .join(ResearcherProfile, ResearcherProfile.user_id == publication_author.c.user_id)\
                             .filter(ResearcherProfile.institution_id == institution_id)

    pubs_by_year_raw = pub_query.with_entities(func.extract('year', Publication.published_date).label('year'), func.count(Publication.id)).group_by('year').all()
    pubs_by_year = [{"year": str(int(r[0])) if r[0] else "Unknown", "count": r[1]} for r in pubs_by_year_raw]

    dept_query = db.query(ResearcherProfile.department, func.count(Publication.id.distinct()))\
                   .join(publication_author, publication_author.c.user_id == ResearcherProfile.user_id)\
                   .join(Publication, Publication.id == publication_author.c.publication_id)
    if institution_id:
        dept_query = dept_query.filter(ResearcherProfile.institution_id == institution_id)
    
    pubs_by_dept_raw = dept_query.group_by(ResearcherProfile.department).all()
    pubs_by_dept = [{"department": r[0] or "Unknown", "count": r[1]} for r in pubs_by_dept_raw]

    pubs_by_type_raw = pub_query.with_entities(Publication.publication_type, func.count(Publication.id)).group_by(Publication.publication_type).all()
    pubs_by_type = [{"type": str(r[0].value) if r[0] else "Unknown", "count": r[1]} for r in pubs_by_type_raw]

    return {
        "publications_by_year": pubs_by_year,
        "publications_by_department": pubs_by_dept,
        "publications_by_type": pubs_by_type
    }

@router.get("/collaboration-stats")
def collaboration_stats(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    institution_id = get_stats_base(db, current_user)

    proj_query = db.query(ResearchProject)
    collab_query = db.query(CollaborationRequest).filter(CollaborationRequest.status == "accepted")

    if institution_id:
        proj_query = proj_query.filter(ResearchProject.institution_id == institution_id)
        collab_query = collab_query.filter(CollaborationRequest.institution_id == institution_id)

    active_collaborations = collab_query.count()
    research_projects = proj_query.count()

    top_collaborators_raw = db.query(User.full_name, func.count(CollaborationRequest.id).label("count"))\
        .join(CollaborationRequest, or_(CollaborationRequest.sender_id == User.id, CollaborationRequest.receiver_id == User.id))\
        .filter(CollaborationRequest.status == CollaborationRequestStatus.ACCEPTED)
    if institution_id:
        top_collaborators_raw = top_collaborators_raw.filter(CollaborationRequest.institution_id == institution_id)
    top_collaborators_raw = top_collaborators_raw.group_by(User.full_name).order_by(func.count(CollaborationRequest.id).desc()).limit(5).all()
    top_collaborators = [{"name": r[0], "collaborations": r[1]} for r in top_collaborators_raw]

    user_counts_raw = db.query(Institution.name, User.role, func.count(User.id))\
        .join(ResearcherProfile, ResearcherProfile.institution_id == Institution.id)\
        .join(User, User.id == ResearcherProfile.user_id)
    if institution_id:
        user_counts_raw = user_counts_raw.filter(ResearcherProfile.institution_id == institution_id)
    user_counts_raw = user_counts_raw.group_by(Institution.name, User.role).all()

    users_by_institution = {}
    for institution_name, role, count in user_counts_raw:
        institution_name = institution_name or "Unknown"
        if institution_name not in users_by_institution:
            users_by_institution[institution_name] = {
                "institution": institution_name,
                "researcher": 0,
                "reviewer": 0,
                "institution_admin": 0,
                "system_admin": 0,
                "total": 0,
            }
        role_key = role.value if hasattr(role, 'value') else str(role)
        if role_key not in users_by_institution[institution_name]:
            users_by_institution[institution_name][role_key] = 0
        users_by_institution[institution_name][role_key] += count
        users_by_institution[institution_name]["total"] += count

    return {
        "active_collaborations": active_collaborations,
        "research_projects": research_projects,
        "top_collaborators": top_collaborators,
        "users_by_institution": list(users_by_institution.values()),
    }

@router.get("/export")
def export_reports(format: str = "csv", type: str = "publications", db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    institution_id = get_stats_base(db, current_user)

    if type == "publications":
        query = db.query(Publication.title, Publication.publication_type, Publication.status, Publication.published_date)
        if institution_id:
            query = query.join(publication_author, publication_author.c.publication_id == Publication.id)\
                         .join(ResearcherProfile, ResearcherProfile.user_id == publication_author.c.user_id)\
                         .filter(ResearcherProfile.institution_id == institution_id).distinct()
        data = query.all()
        
        if format == "csv":
            output = io.StringIO()
            writer = csv.writer(output)
            writer.writerow(["Title", "Type", "Status", "Published Date"])
            for row in data:
                writer.writerow([row[0], row[1].value if row[1] else "", row[2].value if row[2] else "", row[3]])
            
            output.seek(0)
            return StreamingResponse(iter([output.getvalue()]), media_type="text/csv", headers={"Content-Disposition": "attachment; filename=publications.csv"})
        elif format == "excel":
            try:
                import pandas as pd
                df = pd.DataFrame(data, columns=["Title", "Type", "Status", "Published Date"])
                output = io.BytesIO()
                df.to_excel(output, index=False, engine='openpyxl')
                output.seek(0)
                return StreamingResponse(output, media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", headers={"Content-Disposition": "attachment; filename=publications.xlsx"})
            except ImportError:
                raise HTTPException(status_code=500, detail="Pandas or OpenPyXL not installed")
        elif format == "pdf":
            try:
                from reportlab.pdfgen import canvas
                output = io.BytesIO()
                p = canvas.Canvas(output)
                p.drawString(100, 800, "Publications Report")
                y = 780
                for row in data:
                    p.drawString(100, y, f"{row[0]} - {row[1].value if row[1] else ''}")
                    y -= 20
                    if y < 50:
                        p.showPage()
                        y = 800
                p.save()
                output.seek(0)
                return StreamingResponse(output, media_type="application/pdf", headers={"Content-Disposition": "attachment; filename=publications.pdf"})
            except ImportError:
                raise HTTPException(status_code=500, detail="ReportLab not installed")
        else:
            raise HTTPException(status_code=400, detail="Invalid format")
    else:
        raise HTTPException(status_code=400, detail="Invalid report type")
