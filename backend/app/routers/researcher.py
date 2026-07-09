from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.researcher import Researcher
from app.schemas.researcher import (
    ResearcherCreate,
    ResearcherResponse,
    ResearcherUpdate
)

router = APIRouter(
    prefix="/researchers",
    tags=["Researcher Management"]
)

@router.post("/")
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
        research_interests=researcher.research_interests,
        skills=researcher.skills,
        bio=researcher.bio
    )

    db.add(new_researcher)
    db.commit()
    db.refresh(new_researcher)

    return {
        "message": "Researcher created successfully"
    }

@router.get("/")
def get_all_researchers(
    db: Session = Depends(get_db)
):
    researchers = db.query(Researcher).all()
    return researchers

@router.get("/{researcher_id}")
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
@router.put("/{researcher_id}")
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
    researcher.research_interests = updated_researcher.research_interests
    researcher.skills = updated_researcher.skills
    researcher.bio = updated_researcher.bio

    db.commit()
    db.refresh(researcher)

    return {
        "message": "Researcher updated successfully"
    }
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