from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database.session import get_db
from app.models.researcher import Researcher
from app.schemas.researcher import ResearcherCreate, ResearcherResponse

router = APIRouter(prefix="/researchers", tags=["Researchers"])

@router.get("", response_model=List[ResearcherResponse])
def get_researchers(db: Session = Depends(get_db)):
    researchers = db.query(Researcher).all()
    # Fallback to dummy data if database is empty (so dashboard works immediately)
    if not researchers:
        return [
            ResearcherResponse(id="1", name="Dr. Salma", email="salma@scinexus.org", role="Researcher", department="Computer Science"),
            ResearcherResponse(id="2", name="Dr. Siddiqua", email="siddiqua@scinexus.org", role="Researcher", department="Physics"),
            ResearcherResponse(id="3", name="Dr. Mansoor", email="mansoor@scinexus.org", role="Researcher", department="Bioinformatics")
        ]
    return researchers

@router.post("", response_model=ResearcherResponse)
def create_researcher(res_in: ResearcherCreate, db: Session = Depends(get_db)):
    # Check if email exists
    existing = db.query(Researcher).filter(Researcher.email == res_in.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Researcher with this email already exists")
    
    db_res = Researcher(
        name=res_in.name,
        email=res_in.email,
        role=res_in.role,
        institution_id=res_in.institution_id,
        department=res_in.department
    )
    db.add(db_res)
    db.commit()
    db.refresh(db_res)
    return db_res
