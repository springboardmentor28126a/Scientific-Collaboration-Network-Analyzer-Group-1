from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from models import Institution
from pydantic import BaseModel


router = APIRouter(
    prefix="/institution",
    tags=["Institution"]
)


class InstitutionCreate(BaseModel):
    name: str
    location: str
    website: str


# CREATE
@router.post("/")
def create_institution(
    institution: InstitutionCreate,
    db: Session = Depends(get_db)
):

    new_institution = Institution(
        name=institution.name,
        location=institution.location,
        website=institution.website
    )

    db.add(new_institution)
    db.commit()
    db.refresh(new_institution)

    return new_institution



# READ
@router.get("/")
def get_institutions(
    db: Session = Depends(get_db)
):
    return db.query(Institution).all()



# GET ONE
@router.get("/{id}")
def get_institution(
    id:int,
    db:Session = Depends(get_db)
):

    return db.query(Institution).filter(
        Institution.id == id
    ).first()



# UPDATE
@router.put("/{id}")
def update_institution(
    id:int,
    institution:InstitutionCreate,
    db:Session=Depends(get_db)
):

    existing = db.query(Institution).filter(
        Institution.id == id
    ).first()


    existing.name = institution.name
    existing.location = institution.location
    existing.website = institution.website


    db.commit()
    db.refresh(existing)

    return existing



# DELETE
@router.delete("/{id}")
def delete_institution(
    id:int,
    db:Session=Depends(get_db)
):

    institution = db.query(Institution).filter(
        Institution.id == id
    ).first()


    db.delete(institution)
    db.commit()

    return {
        "message":"Institution deleted"
    }