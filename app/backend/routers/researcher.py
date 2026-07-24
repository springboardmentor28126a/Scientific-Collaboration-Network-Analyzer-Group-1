from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.backend.database.database import SessionLocal
from app.backend.models.researcher import Researcher
from app.backend.schemas.researcher import ResearcherCreate, ResearcherResponse

router = APIRouter(
    prefix="/researchers",
    tags=["Researchers"]
)

# Database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/", response_model=ResearcherResponse)
def create_researcher(
    researcher: ResearcherCreate,
    db: Session = Depends(get_db)
):
    new_researcher = Researcher(
        user_id=researcher.user_id,
        full_name=researcher.full_name,
        academic_profile=researcher.academic_profile,
        department=researcher.department,
        institution=researcher.institution,
        skills=researcher.skills,
        research_interest=researcher.research_interest,
        affiliations=researcher.affiliations
    )

    db.add(new_researcher)
    db.commit()
    db.refresh(new_researcher)

    return new_researcher


@router.get("/", response_model=list[ResearcherResponse])
def list_researchers(db: Session = Depends(get_db)):
    return db.query(Researcher).all()


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


@router.put("/{researcher_id}", response_model=ResearcherResponse)
def update_researcher(
    researcher_id: int,
    updated_data: ResearcherCreate,
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

    researcher.user_id = updated_data.user_id
    researcher.full_name = updated_data.full_name
    researcher.academic_profile = updated_data.academic_profile
    researcher.department = updated_data.department
    researcher.institution = updated_data.institution
    researcher.skills = updated_data.skills
    researcher.research_interest = updated_data.research_interest
    researcher.affiliations = updated_data.affiliations

    db.commit()
    db.refresh(researcher)

    return researcher


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
