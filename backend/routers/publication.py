from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.database.database import get_db
from backend.database.models import ActivityEvent, Conference, Institution, Notification, Publication, User
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
# ---------------- CREATE ----------------
@router.post("/")
def create_publication(
    publication: PublicationCreate,
    current_user: User = Depends(require_permission("publication:create")),
    db: Session = Depends(get_db),
):
    # A selected reviewer submits the work for review.  Keeping no reviewer
    # leaves a compatible Draft path for incomplete existing forms.
    selected_reviewer = validate_selected_reviewer(
        publication.selected_reviewer_id, current_user.id, db
    )
    new_publication = Publication(
        title=publication.title,
        authors=publication.authors,
        journal=publication.journal,
        publication_type=publication.publication_type,
        publication_year=publication.publication_year,
        doi=publication.doi,
        keywords=publication.keywords,
        abstract=publication.abstract,
        pdf_file=publication.pdf_file,
        researcher_id=current_user.id,
        institution_id=current_user.institution_id,
        conference_id=publication.conference_id,
        selected_reviewer_id=publication.selected_reviewer_id,
        status="Submitted" if publication.selected_reviewer_id else "Draft",
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


@router.get("/search")
def search_publications(
    q: str | None = Query(None),
    title: str | None = Query(None),
    author: str | None = Query(None),
    journal: str | None = Query(None),
    keyword: str | None = Query(None),
    doi: str | None = Query(None),
    publication_type: str | None = Query(None),
    year: int | None = Query(None),
    status: str | None = Query(None),
    db: Session = Depends(get_db),
):
    query = db.query(Publication)
    term = q or title
    if term:
        query = query.filter(or_(
            Publication.title.ilike(f"%{term}%"), Publication.authors.ilike(f"%{term}%"),
            Publication.journal.ilike(f"%{term}%"), Publication.keywords.ilike(f"%{term}%"),
            Publication.abstract.ilike(f"%{term}%"), Publication.doi.ilike(f"%{term}%"),
        ))
    if author:
        query = query.filter(Publication.authors.ilike(f"%{author}%"))
    if journal:
        query = query.filter(Publication.journal.ilike(f"%{journal}%"))
    if keyword:
        query = query.filter(Publication.keywords.ilike(f"%{keyword}%"))
    if doi:
        query = query.filter(Publication.doi.ilike(f"%{doi}%"))
    if publication_type:
        query = query.filter(Publication.publication_type == publication_type)
    if year:
        query = query.filter(Publication.publication_year == year)
    if status:
        query = query.filter(
            Publication.status == status
        )

    return query.limit(20).all()
# ---------------- GET BY ID ----------------
@router.get("/{publication_id}")
def get_publication(publication_id: int, db: Session = Depends(get_db)):
    publication = db.query(Publication).filter(
        Publication.id == publication_id
    ).first()

    if not publication:
        raise HTTPException(status_code=404, detail="Publication not found")

    return publication

from fastapi import Query, Depends
from sqlalchemy import or_

@router.get("/search")
def search_publications(
    q: str = Query(..., description="Search text"),
    db: Session = Depends(get_db)
):
    return (
        db.query(Publication)
        .filter(
            or_(
                Publication.title.ilike(f"%{q}%"),
                Publication.authors.ilike(f"%{q}%"),
                Publication.journal.ilike(f"%{q}%"),
                Publication.keywords.ilike(f"%{q}%"),
                Publication.abstract.ilike(f"%{q}%"),
                Publication.doi.ilike(f"%{q}%"),
            )
        )
        .limit(20)
        .all()
    )

# @router.get("/search")
# def search_publications(

#     title: str = Query(None),

#     author: str = Query(None),

#     journal: str = Query(None),

#     publication_type: str = Query(None),

#     keyword: str = Query(None),

#     year: int = Query(None),

#     status: str = Query(None),

#     doi: str = Query(None),

#     db: Session = Depends(get_db)

# ):

#     query = db.query(Publication)

#     if title:

#         query = query.filter(

#             Publication.title.ilike(f"%{title}%")

#         )

#     if author:

#         query = query.filter(

#             Publication.authors.ilike(f"%{author}%")

#         )

#     if journal:

#         query = query.filter(

#             Publication.journal.ilike(f"%{journal}%")

#         )

#     if publication_type:

#         query = query.filter(

#             Publication.publication_type == publication_type

#         )

#     if keyword:

#         query = query.filter(

#             Publication.keywords.ilike(f"%{keyword}%")

#         )

#     if year:

#         query = query.filter(

#             Publication.publication_year == year

#         )

#     if status:

#         query = query.filter(

#             Publication.status == status

#         )

#     if doi:

#         query = query.filter(

#             Publication.doi.ilike(f"%{doi}%")

#         )

#     return query.all()

# # ---------------- SEARCH BY TITLE ----------------
# @router.get("/search/{title}")
# def search_publication(title: str, db: Session = Depends(get_db)):
#     publications = db.query(Publication).filter(
#         Publication.title.ilike(f"%{title}%")
#     ).all()

#     if not publications:
#         raise HTTPException(
#             status_code=404,
#             detail="No publications found"
#         )

#     return publications


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
    current_user: User = Depends(require_permission("publication:update")),
    db: Session = Depends(get_db),
):
    existing = db.query(Publication).filter(Publication.id == publication_id).first()
    if not existing:
        raise HTTPException(status_code=404, detail="Publication not found")
    require_publication_owner(existing, current_user)
    validate_selected_reviewer(publication.selected_reviewer_id, existing.researcher_id, db)

    for field in ("title", "authors", "journal", "publication_type", "publication_year", "doi", "keywords", "abstract", "pdf_file", "conference_id"):
        setattr(existing, field, getattr(publication, field))
    existing.selected_reviewer_id = publication.selected_reviewer_id
    existing.status = "Submitted" if publication.selected_reviewer_id else "Draft"
    existing.reviewed_by = None
    existing.reviewed_at = None
    existing.review_comments = None
    db.commit()
    db.refresh(existing)
    return {"message": "Publication updated successfully.", "publication": publication_payload(existing)}


@router.delete("/{publication_id}")
def delete_publication(
    publication_id: int,
    current_user: User = Depends(require_permission("publication:delete")),
    db: Session = Depends(get_db),
):
    publication = db.query(Publication).filter(Publication.id == publication_id).first()
    if not publication:
        raise HTTPException(status_code=404, detail="Publication not found")
    require_publication_owner(publication, current_user)
    db.delete(publication)
    db.commit()
    return {"message": "Publication deleted successfully"}


@router.post("/upload")
def upload_publication_pdf(
    file: UploadFile = File(...),
    current_user: User = Depends(require_permission("publication:create")),
):
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed.")
    # Prefixing prevents an owner from overwriting another user's upload.
    safe_name = f"{current_user.id}_{os.path.basename(file.filename)}"
    folder = "uploads/papers"
    os.makedirs(folder, exist_ok=True)
    file_path = os.path.join(folder, safe_name)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    return {"filename": safe_name, "pdf_url": f"/uploads/papers/{safe_name}"}
