from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database.session import get_db
from app.models.project import Project
from app.models.notification import Notification
from app.schemas.project import ProjectCreate, ProjectResponse

router = APIRouter(prefix="/projects", tags=["Projects"])

@router.get("", response_model=List[ProjectResponse])
def get_projects(db: Session = Depends(get_db)):
    return db.query(Project).all()

@router.post("", response_model=ProjectResponse)
def create_project(proj_in: ProjectCreate, db: Session = Depends(get_db)):
    db_proj = Project(
        title=proj_in.title,
        description=proj_in.description,
        funding_agency=proj_in.funding_agency,
        budget=proj_in.budget,
        lead_researcher_id=proj_in.lead_researcher_id,
        institution_id=proj_in.institution_id,
        status=proj_in.status,
        start_date=proj_in.start_date,
        end_date=proj_in.end_date
    )
    db.add(db_proj)
    db.commit()
    db.refresh(db_proj)

    # Trigger a notification
    notification = Notification(
        user_email="all",
        title="New Research Project Initialized",
        message=f"Project '{proj_in.title}' funded by {proj_in.funding_agency or 'SciNexus'} has been active with budget ${proj_in.budget:,}.",
        notification_type="info",
        is_read=False
    )
    db.add(notification)
    db.commit()

    return db_proj
