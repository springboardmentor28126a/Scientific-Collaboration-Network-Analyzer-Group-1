from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.researcher import Researcher
from app.schemas.researcher import (
    ResearcherCreate,
    ResearcherResponse,
    ResearcherUpdate
)

from app.services.audit_service import create_audit_log
from app.schemas.audit import AuditLogCreate


router = APIRouter(
    prefix="/researchers",
    tags=["Researcher Management"]
)


# =========================
# CREATE RESEARCHER
# =========================

@router.post("/", response_model=ResearcherResponse)
def create_researcher(
    researcher: ResearcherCreate,
    db: Session = Depends(get_db)
):

    existing = db.query(Researcher).filter(
        Researcher.email == researcher.email
    ).first()

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Researcher already exists"
        )

    new_researcher = Researcher(
        name=researcher.name,
        email=researcher.email,
        university=researcher.university,
        department=researcher.department,
        designation=researcher.designation,
        experience=researcher.experience,
        phone=researcher.phone,
        research_interests=researcher.research_interests,
        skills=researcher.skills,
        bio=researcher.bio
    )

    db.add(new_researcher)
    db.commit()
    db.refresh(new_researcher)

    # Audit notification
    create_audit_log(
        db,
        AuditLogCreate(
            user_id=None,
            action="RESEARCHER_ADDED",
            module="Researcher",
            description=f"Researcher {new_researcher.name} was added",
            entity_type="Researcher",
            entity_id=new_researcher.id
        )
    )

    return new_researcher


# =========================
# GET ALL RESEARCHERS
# =========================

@router.get("/", response_model=list[ResearcherResponse])
def get_all_researchers(
    db: Session = Depends(get_db)
):
    researchers = db.query(Researcher).all()
    return researchers


# =========================
# GET RESEARCHER
# =========================

@router.get("/{researcher_id}", response_model=ResearcherResponse)
def get_researcher(
    researcher_id: int,
    db: Session = Depends(get_db)
):

    researcher = db.query(Researcher).filter(
        Researcher.id == researcher_id
    ).first()

    if not researcher:
        raise HTTPException(
            status_code=404,
            detail="Researcher not found"
        )

    return researcher


# =========================
# UPDATE RESEARCHER
# =========================

@router.put("/{researcher_id}", response_model=ResearcherResponse)
def update_researcher(
    researcher_id: int,
    updated_researcher: ResearcherUpdate,
    db: Session = Depends(get_db)
):

    researcher = db.query(Researcher).filter(
        Researcher.id == researcher_id
    ).first()

    if not researcher:
        raise HTTPException(
            status_code=404,
            detail="Researcher not found"
        )

    researcher.name = updated_researcher.name
    researcher.email = updated_researcher.email
    researcher.university = updated_researcher.university
    researcher.department = updated_researcher.department
    researcher.designation = updated_researcher.designation
    researcher.experience = updated_researcher.experience
    researcher.phone = updated_researcher.phone
    researcher.research_interests = updated_researcher.research_interests
    researcher.skills = updated_researcher.skills
    researcher.bio = updated_researcher.bio

    db.commit()
    db.refresh(researcher)

    return researcher


# =========================
# DELETE RESEARCHER
# =========================

@router.delete("/{researcher_id}")
def delete_researcher(
    researcher_id: int,
    db: Session = Depends(get_db)
):

    researcher = db.query(Researcher).filter(
        Researcher.id == researcher_id
    ).first()

    if not researcher:
        raise HTTPException(
            status_code=404,
            detail="Researcher not found"
        )

    db.delete(researcher)
    db.commit()

    return {
        "message": "Researcher deleted successfully"
    }