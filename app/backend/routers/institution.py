from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.backend.database.database import get_db
from app.backend.models.institution import Institution
from app.backend.schemas.institution import InstitutionCreate, InstitutionResponse

router = APIRouter(prefix="/institutions", tags=["Institutions"])


@router.post("/", response_model=InstitutionResponse)
def create_institution(institution: InstitutionCreate, db: Session = Depends(get_db)):
    existing = db.query(Institution).filter(Institution.name == institution.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Institution already exists")

    new_institution = Institution(**institution.model_dump())
    db.add(new_institution)
    db.commit()
    db.refresh(new_institution)
    return new_institution


@router.get("/", response_model=list[InstitutionResponse])
def list_institutions(db: Session = Depends(get_db)):
    return db.query(Institution).all()


@router.get("/{institution_id}", response_model=InstitutionResponse)
def get_institution(institution_id: int, db: Session = Depends(get_db)):
    institution = db.query(Institution).filter(Institution.id == institution_id).first()
    if not institution:
        raise HTTPException(status_code=404, detail="Institution not found")
    return institution


@router.put("/{institution_id}", response_model=InstitutionResponse)
def update_institution(
    institution_id: int,
    updated_data: InstitutionCreate,
    db: Session = Depends(get_db),
):
    institution = db.query(Institution).filter(Institution.id == institution_id).first()
    if not institution:
        raise HTTPException(status_code=404, detail="Institution not found")

    for key, value in updated_data.model_dump().items():
        setattr(institution, key, value)

    db.commit()
    db.refresh(institution)
    return institution


@router.delete("/{institution_id}")
def delete_institution(institution_id: int, db: Session = Depends(get_db)):
    institution = db.query(Institution).filter(Institution.id == institution_id).first()
    if not institution:
        raise HTTPException(status_code=404, detail="Institution not found")

    db.delete(institution)
    db.commit()
    return {"message": "Institution deleted successfully"}
