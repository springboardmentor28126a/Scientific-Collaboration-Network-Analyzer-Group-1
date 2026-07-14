from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database.database import get_db
from database.models import Publication
from schemas.publication import PublicationCreate
from fastapi import UploadFile, File
import shutil
import os

router = APIRouter(
    prefix="/publications",
    tags=["Publication"]
)


# ---------------- CREATE ----------------
# ---------------- CREATE ----------------
@router.post("/")
def create_publication(
    publication: PublicationCreate,
    db: Session = Depends(get_db)
):
    try:
        new_publication = Publication(
            title=publication.title,
            authors=publication.authors,
            journal=publication.journal,
            publication_year=publication.publication_year,
            doi=publication.doi,
            keywords=publication.keywords,
            status=publication.status,
            researcher_id=publication.researcher_id
        )

        db.add(new_publication)
        db.commit()
        db.refresh(new_publication)

        return {
            "message": "Publication Added Successfully",
            "publication": new_publication
        }

    except Exception as e:
        db.rollback()
        print("DATABASE ERROR:", e)
        raise HTTPException(status_code=500, detail=str(e))

# ---------------- GET ALL ----------------
@router.get("/")
def get_publications(db: Session = Depends(get_db)):
    return db.query(Publication).all()


# ---------------- GET BY ID ----------------
@router.get("/{publication_id}")
def get_publication(publication_id: int, db: Session = Depends(get_db)):
    publication = db.query(Publication).filter(
        Publication.id == publication_id
    ).first()

    if not publication:
        raise HTTPException(status_code=404, detail="Publication not found")

    return publication

# ---------------- SEARCH BY TITLE ----------------
@router.get("/search/{title}")
def search_publication(title: str, db: Session = Depends(get_db)):
    publications = db.query(Publication).filter(
        Publication.title.ilike(f"%{title}%")
    ).all()

    if not publications:
        raise HTTPException(
            status_code=404,
            detail="No publications found"
        )

    return publications


# ---------------- FILTER BY YEAR ----------------
@router.get("/year/{year}")
def publications_by_year(year: int, db: Session = Depends(get_db)):
    publications = db.query(Publication).filter(
        Publication.publication_year == year
    ).all()

    if not publications:
        raise HTTPException(
            status_code=404,
            detail="No publications found"
        )

    return publications


# ---------------- FILTER BY STATUS ----------------
@router.get("/status/{status}")
def publications_by_status(status: str, db: Session = Depends(get_db)):
    publications = db.query(Publication).filter(
        Publication.status == status
    ).all()

    if not publications:
        raise HTTPException(
            status_code=404,
            detail="No publications found"
        )

    return publications


# ---------------- UPDATE ----------------
@router.put("/{publication_id}")
def update_publication(
    publication_id: int,
    publication: PublicationCreate,
    db: Session = Depends(get_db)
):

    db_publication = db.query(Publication).filter(
        Publication.id == publication_id
    ).first()

    if not db_publication:
        raise HTTPException(status_code=404, detail="Publication not found")

    db_publication.title = publication.title
    db_publication.authors = publication.authors
    db_publication.journal = publication.journal
    db_publication.publication_year = publication.publication_year
    db_publication.doi = publication.doi
    db_publication.keywords = publication.keywords
    db_publication.status = publication.status
    db_publication.researcher_id = publication.researcher_id

    db.commit()
    db.refresh(db_publication)

    return {
        "message": "Publication Updated Successfully",
        "publication": db_publication
    }


# ---------------- DELETE ----------------
@router.delete("/{publication_id}")
def delete_publication(
    publication_id: int,
    db: Session = Depends(get_db)
):

    publication = db.query(Publication).filter(
        Publication.id == publication_id
    ).first()

    if not publication:
        raise HTTPException(status_code=404, detail="Publication not found")

    db.delete(publication)
    db.commit()

    return {
        "message": "Publication Deleted Successfully"
    }
@router.post("/upload")

def upload_pdf(

    file: UploadFile = File(...)

):

    folder = "uploads/papers"

    os.makedirs(folder, exist_ok=True)

    file_path = os.path.join(

        folder,

        file.filename

    )

    with open(file_path, "wb") as buffer:

        shutil.copyfileobj(

            file.file,

            buffer

        )

    return {

        "filename": file.filename,

        "path": file_path

    }
@router.post("/upload")
def upload_publication_pdf(
    file: UploadFile = File(...)
):

    if not file.filename.lower().endswith(".pdf"):

        raise HTTPException(
            status_code=400,
            detail="Only PDF files are allowed."
        )

    folder = "uploads/papers"

    os.makedirs(folder, exist_ok=True)

    file_path = os.path.join(
        folder,
        file.filename
    )

    with open(file_path, "wb") as buffer:

        shutil.copyfileobj(
            file.file,
            buffer
        )

    return {

        "filename": file.filename,

        "pdf_url": f"/uploads/papers/{file.filename}"

    }