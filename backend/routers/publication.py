from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.database.database import get_db
from backend.database.models import Publication
from backend.schemas.publication import PublicationCreate
from fastapi import UploadFile, File
import shutil
import os
from fastapi import Query
from sqlalchemy import or_

router = APIRouter(
    prefix="/publications",
    tags=["Publication"]
)


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
            researcher_id=publication.researcher_id,
            abstract=publication.abstract,
            publication_type=publication.publication_type,
            institution_id=publication.institution_id,
            conference_id=publication.conference_id,
            pdf_file=publication.pdf_file,
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


# ---------------- SEARCH (moved ABOVE /{publication_id} — this was the bug) ----------------
@router.get("/search")
def search_publications(
    title: str = Query(None),
    author: str = Query(None),
    journal: str = Query(None),
    publication_type: str = Query(None),
    keyword: str = Query(None),
    year: int = Query(None),
    status: str = Query(None),
    doi: str = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(Publication)

    if title:
        query = query.filter(Publication.title.ilike(f"%{title}%"))

    if author:
        query = query.filter(Publication.authors.ilike(f"%{author}%"))

    if journal:
        query = query.filter(Publication.journal.ilike(f"%{journal}%"))

    if publication_type:
        query = query.filter(Publication.publication_type == publication_type)

    if keyword:
        query = query.filter(Publication.keywords.ilike(f"%{keyword}%"))

    if year:
        query = query.filter(Publication.publication_year == year)

    if status:
        query = query.filter(Publication.status == status)

    if doi:
        query = query.filter(Publication.doi.ilike(f"%{doi}%"))

    return query.all()


# ---------------- SEARCH BY TITLE (also moved above /{publication_id}) ----------------
@router.get("/search/{title}")
def search_publication(title: str, db: Session = Depends(get_db)):
    publications = db.query(Publication).filter(
        Publication.title.ilike(f"%{title}%")
    ).all()

    if not publications:
        raise HTTPException(status_code=404, detail="No publications found")

    return publications


# ---------------- FILTER BY YEAR (moved above /{publication_id}) ----------------
@router.get("/year/{year}")
def publications_by_year(year: int, db: Session = Depends(get_db)):
    publications = db.query(Publication).filter(
        Publication.publication_year == year
    ).all()

    if not publications:
        raise HTTPException(status_code=404, detail="No publications found")

    return publications


# ---------------- FILTER BY STATUS (moved above /{publication_id}) ----------------
@router.get("/status/{status}")
def publications_by_status(status: str, db: Session = Depends(get_db)):
    publications = db.query(Publication).filter(
        Publication.status == status
    ).all()

    if not publications:
        raise HTTPException(status_code=404, detail="No publications found")

    return publications


# ---------------- GET BY ID (now correctly LAST among the GET routes) ----------------
@router.get("/{publication_id}")
def get_publication(publication_id: int, db: Session = Depends(get_db)):
    publication = db.query(Publication).filter(
        Publication.id == publication_id
    ).first()

    if not publication:
        raise HTTPException(status_code=404, detail="Publication not found")

    return publication


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
    db_publication.abstract = publication.abstract
    db_publication.publication_type = publication.publication_type
    db_publication.pdf_file = publication.pdf_file
    db_publication.researcher_id = publication.researcher_id
    db_publication.institution_id = publication.institution_id
    db_publication.conference_id = publication.conference_id

    db.commit()
    db.refresh(db_publication)

    return {
        "message": "Publication Updated Successfully",
        "publication": {
            "id": db_publication.id,
            "title": db_publication.title,
            "authors": db_publication.authors,
            "journal": db_publication.journal,
            "publication_year": db_publication.publication_year,
            "doi": db_publication.doi,
            "keywords": db_publication.keywords,
            "status": db_publication.status,
            "abstract": db_publication.abstract,
            "pdf_file": db_publication.pdf_file,
            "researcher_id": db_publication.researcher_id,
            "institution_id": db_publication.institution_id,
            "conference_id": db_publication.conference_id,
            "uploaded_at": db_publication.uploaded_at
        }
    }


# ---------------- DETAILS ----------------
@router.get("/details/{publication_id}")
def get_publication_details(publication_id: int, db: Session = Depends(get_db)):
    publication = db.query(Publication).filter(
        Publication.id == publication_id
    ).first()

    if not publication:
        raise HTTPException(status_code=404, detail="Publication not found")

    related_publications = db.query(Publication).filter(
        Publication.id != publication_id,
        Publication.keywords.ilike(f"%{publication.keywords}%")
    ).limit(5).all() if publication.keywords else []

    similar_research = db.query(Publication).filter(
        Publication.id != publication_id,
        Publication.authors.ilike(f"%{publication.authors.split(',')[0]}%")
    ).limit(5).all() if publication.authors else []

    conference = None
    institution = None

    if publication.conference_id:
        from backend.database.models import Conference
        conference = db.query(Conference).filter(Conference.id == publication.conference_id).first()

    if publication.institution_id:
        from backend.database.models import Institution
        institution = db.query(Institution).filter(Institution.id == publication.institution_id).first()

    return {
        "publication": {
            "id": publication.id,
            "title": publication.title,
            "authors": publication.authors,
            "journal": publication.journal,
            "publication_type": publication.publication_type,
            "publication_year": publication.publication_year,
            "doi": publication.doi,
            "keywords": publication.keywords,
            "status": publication.status,
            "abstract": publication.abstract,
            "pdf_file": publication.pdf_file,
            "researcher_id": publication.researcher_id,
            "institution_id": publication.institution_id,
            "conference_id": publication.conference_id,
            "uploaded_at": publication.uploaded_at
        },
        "institution": {
            "id": institution.id,
            "name": institution.name,
            "city": institution.city,
            "country": institution.country
        } if institution else None,
        "conference": {
            "id": conference.id,
            "name": conference.name,
            "location": conference.location,
            "start_date": conference.start_date,
            "end_date": conference.end_date
        } if conference else None,
        "related_publications": [
            {
                "id": pub.id,
                "title": pub.title,
                "authors": pub.authors,
                "journal": pub.journal,
                "publication_year": pub.publication_year
            }
            for pub in related_publications
        ],
        "similar_research": [
            {
                "id": pub.id,
                "title": pub.title,
                "authors": pub.authors,
                "journal": pub.journal,
                "publication_year": pub.publication_year
            }
            for pub in similar_research
        ]
    }

@router.get("/user/{user_id}")
def get_user_publications(
    user_id: int,
    db: Session = Depends(get_db)
):
    publications = (
        db.query(Publication)
        .filter(Publication.researcher_id == user_id)
        .order_by(Publication.uploaded_at.desc())
        .all()
    )

    return publications
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


# ---------------- UPLOAD (kept only the version that validates .pdf; removed the duplicate) ----------------
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
    file_path = os.path.join(folder, file.filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return {
        "filename": file.filename,
        "pdf_url": f"/uploads/papers/{file.filename}"
    }