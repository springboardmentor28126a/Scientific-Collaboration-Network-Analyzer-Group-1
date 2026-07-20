from fastapi import HTTPException
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.backend.database.database import SessionLocal
from app.backend.models.publication import Publication
from app.backend.schemas.publication import PublicationCreate, PublicationResponse

router = APIRouter(
    prefix="/publications",
    tags=["Publications"]
)

# Database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=PublicationResponse)
def create_publication(
    publication: PublicationCreate,
    db: Session = Depends(get_db)
):
    new_publication = Publication(
        researcher_id=publication.researcher_id,
        title=publication.title,
        publication_type=publication.publication_type,
        publication_name=publication.publication_name,
        publication_year=publication.publication_year,
        doi=publication.doi,
        status=publication.status,
        upload_path=publication.upload_path
    )

    db.add(new_publication)
    db.commit()
    db.refresh(new_publication)

    return new_publication

@router.get("/", response_model=list[PublicationResponse])
def list_publications(db: Session = Depends(get_db)):
    return db.query(Publication).all()

@router.get("/{publication_id}", response_model=PublicationResponse)
def get_publication(
    publication_id: int,
    db: Session = Depends(get_db)
):
    publication = db.query(Publication).filter(
        Publication.id == publication_id
    ).first()

    if not publication:
        raise HTTPException(
            status_code=404,
            detail="Publication not found"
        )

    return publication

@router.put("/{publication_id}", response_model=PublicationResponse)
def update_publication(
    publication_id: int,
    updated_publication: PublicationCreate,
    db: Session = Depends(get_db)
):
    publication = db.query(Publication).filter(
        Publication.id == publication_id
    ).first()

    if not publication:
        raise HTTPException(
            status_code=404,
            detail="Publication not found"
        )

    publication.researcher_id = updated_publication.researcher_id
    publication.title = updated_publication.title
    publication.publication_type = updated_publication.publication_type
    publication.publication_name = updated_publication.publication_name
    publication.publication_year = updated_publication.publication_year
    publication.doi = updated_publication.doi
    publication.status = updated_publication.status
    publication.upload_path = updated_publication.upload_path

    db.commit()
    db.refresh(publication)

    return publication

@router.delete("/{publication_id}")
def delete_publication(
    publication_id: int,
    db: Session = Depends(get_db)
):
    publication = db.query(Publication).filter(
        Publication.id == publication_id
    ).first()

    if not publication:
        raise HTTPException(
            status_code=404,
            detail="Publication not found"
        )

    db.delete(publication)
    db.commit()

    return {
        "message": "Publication deleted successfully"
    }
