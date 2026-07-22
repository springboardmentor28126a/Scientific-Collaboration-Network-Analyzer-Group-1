from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import asc, desc, func
from sqlalchemy.orm import Session

from app.backend.database.database import get_db
from app.backend.models.institution import Institution
from app.backend.schemas.institution import (
    InstitutionCreate,
    InstitutionUpdate,
    InstitutionResponse,
)

router = APIRouter(
    prefix="/institutions",
    tags=["Institutions"],
)


# -----------------------------
# Create Institution
# -----------------------------
@router.post("/", response_model=InstitutionResponse)
def create_institution(
    institution: InstitutionCreate,
    db: Session = Depends(get_db),
):
    existing = (
        db.query(Institution)
        .filter(Institution.name == institution.name)
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Institution already exists",
        )

    new_institution = Institution(**institution.model_dump())

    db.add(new_institution)
    db.commit()
    db.refresh(new_institution)

    return new_institution


# -----------------------------
# List All Institutions
# -----------------------------
@router.get("/", response_model=list[InstitutionResponse])
def list_institutions(db: Session = Depends(get_db)):
    return db.query(Institution).all()


@router.get("/search", response_model=list[InstitutionResponse])
def search_institutions(
    name: str | None = None,
    country: str | None = None,
    city: str | None = None,
    institution_type: str | None = None,
    db: Session = Depends(get_db),
):
    query = db.query(Institution)

    if name:
        query = query.filter(
            Institution.name.ilike(f"%{name}%")
        )

    if country:
        query = query.filter(
            Institution.country.ilike(f"%{country}%")
        )

    if city:
        query = query.filter(
            Institution.city.ilike(f"%{city}%")
        )

    if institution_type:
        query = query.filter(
            Institution.institution_type.ilike(f"%{institution_type}%")
        )

    return query.all()

# -----------------------------
# Sort Institutions
# -----------------------------
@router.get("/sort", response_model=list[InstitutionResponse])
def sort_institutions(
    order: str = "asc",
    db: Session = Depends(get_db),
):
    if order.lower() == "desc":
        return (
            db.query(Institution)
            .order_by(desc(Institution.name))
            .all()
        )

    return (
        db.query(Institution)
        .order_by(asc(Institution.name))
        .all()
    )


# -----------------------------
# Institution Count
# -----------------------------
@router.get("/count")
def institution_count(db: Session = Depends(get_db)):
    total = db.query(func.count(Institution.id)).scalar()

    return {
        "total_institutions": total
    }


# -----------------------------
# Get Institution by ID
# -----------------------------
@router.get("/{institution_id}", response_model=InstitutionResponse)
def get_institution(
    institution_id: int,
    db: Session = Depends(get_db),
):
    institution = (
        db.query(Institution)
        .filter(Institution.id == institution_id)
        .first()
    )

    if not institution:
        raise HTTPException(
            status_code=404,
            detail="Institution not found",
        )

    return institution


# -----------------------------
# Update Institution
# -----------------------------
@router.put("/{institution_id}", response_model=InstitutionResponse)
def update_institution(
    institution_id: int,
    updated_data: InstitutionUpdate,
    db: Session = Depends(get_db),
):
    institution = (
        db.query(Institution)
        .filter(Institution.id == institution_id)
        .first()
    )

    if not institution:
        raise HTTPException(
            status_code=404,
            detail="Institution not found",
        )

    for key, value in updated_data.model_dump().items():
        setattr(institution, key, value)

    db.commit()
    db.refresh(institution)

    return institution


# -----------------------------
# Delete Institution
# -----------------------------
@router.delete("/{institution_id}")
def delete_institution(
    institution_id: int,
    db: Session = Depends(get_db),
):
    institution = (
        db.query(Institution)
        .filter(Institution.id == institution_id)
        .first()
    )

    if not institution:
        raise HTTPException(
            status_code=404,
            detail="Institution not found",
        )

    db.delete(institution)
    db.commit()

    return {
        "success": True,
        "message": "Institution deleted successfully",
    }