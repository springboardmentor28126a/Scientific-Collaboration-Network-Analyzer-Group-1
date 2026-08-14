import os
import shutil
import logging

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile
from sqlalchemy import case, or_
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, joinedload

from backend.database.database import get_db
from backend.database.models import Institution, Notification, Publication, User
from backend.schemas.publication import PublicationCreate
from backend.utils.dependencies import require_permission


router = APIRouter(prefix="/publications", tags=["Publication"])
logger = logging.getLogger(__name__)


def publication_query(db: Session):
    """Build publication queries with the relationships used by serializers preloaded."""
    return db.query(Publication).options(
        joinedload(Publication.selected_reviewer),
        joinedload(Publication.reviewer),
    )


def publication_payload(publication: Publication) -> dict:
    """Return the stable JSON shape used by the publication UI and reviewer UI."""
    return {
        "id": publication.id,
        "title": publication.title,
        "authors": publication.authors,
        "journal": publication.journal,
        "publication_type": publication.publication_type,
        "publication_year": publication.publication_year,
        "doi": publication.doi,
        "keywords": publication.keywords,
        "abstract": publication.abstract,
        "pdf_file": publication.pdf_file,
        "status": publication.status,
        "researcher_id": publication.researcher_id,
        "institution_id": publication.institution_id,
        "conference_id": publication.conference_id,
        "selected_reviewer_id": publication.selected_reviewer_id,
        "selected_reviewer_name": (
            publication.selected_reviewer.name
            if publication.selected_reviewer else None
        ),
        "reviewed_by": publication.reviewed_by,
        "reviewer_name": (
            publication.reviewer.name
            if publication.reviewer else None
        ),
        "reviewed_at": publication.reviewed_at,
        "review_comments": publication.review_comments,
        "uploaded_at": publication.uploaded_at,
    }


def require_publication_owner(publication: Publication, current_user: User) -> None:
    if current_user.role != "System Admin" and publication.researcher_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only manage your own publications.")


def validate_selected_reviewer(
    reviewer_id: int | None, owner_id: int, db: Session
) -> User | None:
    if reviewer_id is None:
        return None
    reviewer = db.query(User).filter(
        User.id == reviewer_id,
        User.role == "Reviewer",
        User.is_verified.is_(True),
    ).first()
    if reviewer is None:
        raise HTTPException(status_code=400, detail="Selected reviewer is not valid.")
    if reviewer.id == owner_id:
        raise HTTPException(status_code=400, detail="A researcher cannot review their own publication.")
    return reviewer


@router.post("/")
def create_publication(
    publication: PublicationCreate,
    current_user: User = Depends(require_permission("publication:create")),
    db: Session = Depends(get_db),
):
    validate_selected_reviewer(publication.selected_reviewer_id, current_user.id, db)
    publication_data = publication.model_dump()
    publication_data["doi"] = publication_data.get("doi") or None
    selected_institution_id = publication_data.pop("institution_id", None) or current_user.institution_id
    if selected_institution_id is not None and not db.query(Institution).filter(
        Institution.id == selected_institution_id
    ).first():
        raise HTTPException(status_code=400, detail="Selected institution is not valid.")
    new_publication = Publication(
        **publication_data,
        researcher_id=current_user.id,
        institution_id=selected_institution_id,
        status="Pending Review" if publication.selected_reviewer_id else "Draft",
    )
    try:
        db.add(new_publication)
        db.flush()

        if new_publication.selected_reviewer_id:
            db.add(Notification(
                user_id=new_publication.selected_reviewer_id,
                title="Publication review requested",
                message=(
                    f"{current_user.name} sent '{new_publication.title}' for review. "
                    "Please accept or reject this publication."
                ),
                notification_type="publication_review_request",
                resource_type="publication",
                resource_id=new_publication.id,
            ))

        interested_users = db.query(User).filter(
            User.id != current_user.id,
            User.role != "System Admin",
            User.account_status == "Active",
        ).all()
        db.add_all([
            Notification(
                user_id=user.id,
                title="New publication",
                message=f"{current_user.name} published a new research record: {new_publication.title}.",
                notification_type="publication_created",
                resource_type="publication",
                resource_id=new_publication.id,
            )
            for user in interested_users
            if user.id != new_publication.selected_reviewer_id
        ])

        db.commit()
        db.refresh(new_publication)
    except IntegrityError as exc:
        db.rollback()
        logger.exception("Publication create failed due to a database error")
        if "publications_doi_key" in str(exc.orig):
            raise HTTPException(
                status_code=409,
                detail="A publication with this DOI already exists.",
            ) from exc
        raise HTTPException(status_code=500, detail="Could not create publication.") from exc
    except Exception as exc:
        db.rollback()
        logger.exception("Publication create failed")
        raise HTTPException(status_code=500, detail="Could not create publication.") from exc
    return {"message": "Publication added successfully", "publication": publication_payload(new_publication)}


@router.get("/")
def get_publications(
    page: int = Query(1, ge=1),
    page_size: int = Query(6, ge=1, le=100),
    current_user: User = Depends(require_permission("publication:view")),
    db: Session = Depends(get_db),
):
    query = publication_query(db)
    priority = case(
        (Publication.researcher_id == current_user.id, 0),
        (Publication.selected_reviewer_id == current_user.id, 0),
        (Publication.reviewed_by == current_user.id, 0),
        (Publication.authors.ilike(f"%{current_user.name}%"), 0),
        else_=1,
    )
    total = query.count()
    publications = query.order_by(priority, Publication.uploaded_at.desc(), Publication.id.desc()).offset(
        (page - 1) * page_size
    ).limit(page_size).all()
    return {
        "items": [publication_payload(publication) for publication in publications],
        "total": total,
        "page": page,
        "page_size": page_size,
        "page_count": max(1, (total + page_size - 1) // page_size),
    }


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
    current_user: User = Depends(require_permission("publication:view")),
    db: Session = Depends(get_db),
):
    query = publication_query(db)
    term = q or title
    if term:
        query = query.filter(or_(*[
            field.ilike(f"%{term}%")
            for field in (
                Publication.title, Publication.authors, Publication.journal,
                Publication.keywords, Publication.abstract, Publication.doi,
            )
        ]))
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
        query = query.filter(Publication.status == status)
    return [publication_payload(publication) for publication in query.limit(20).all()]


@router.get("/year/{year}")
def publications_by_year(
    year: int,
    current_user: User = Depends(require_permission("publication:view")),
    db: Session = Depends(get_db),
):
    publications = db.query(Publication).filter(Publication.publication_year == year).all()
    if not publications:
        raise HTTPException(status_code=404, detail="No publications found")
    return publications


@router.get("/status/{status}")
def publications_by_status(
    status: str,
    current_user: User = Depends(require_permission("publication:view")),
    db: Session = Depends(get_db),
):
    publications = db.query(Publication).filter(Publication.status == status).all()
    if not publications:
        raise HTTPException(status_code=404, detail="No publications found")
    return publications


@router.get("/details/{publication_id}")
def publication_details(
    publication_id: int,
    current_user: User = Depends(require_permission("publication:view")),
    db: Session = Depends(get_db),
):
    publication = db.query(Publication).filter(Publication.id == publication_id).first()
    if publication is None:
        raise HTTPException(status_code=404, detail="Publication not found")

    related = db.query(Publication).filter(
        Publication.id != publication.id,
        Publication.authors.ilike(f"%{publication.authors}%"),
    ).limit(10).all()

    similar = []
    if publication.keywords:
        similar = db.query(Publication).filter(
            Publication.id != publication.id,
            Publication.keywords.ilike(f"%{publication.keywords}%"),
        ).limit(10).all()

    publication_data = publication_payload(publication)
    publication_data["selected_reviewer_name"] = (
        publication.selected_reviewer.name if publication.selected_reviewer else None
    )
    publication_data["reviewer_name"] = (
        publication.reviewer.name if publication.reviewer else None
    )
    return {
        "publication": publication_data,
        "institution": publication.institution,
        "conference": publication.conference,
        "related_publications": [publication_payload(item) for item in related],
        "similar_research": [publication_payload(item) for item in similar],
    }


@router.get("/{publication_id}")
def get_publication(
    publication_id: int,
    current_user: User = Depends(require_permission("publication:view")),
    db: Session = Depends(get_db),
):
    publication = db.query(Publication).filter(Publication.id == publication_id).first()
    if publication is None:
        raise HTTPException(status_code=404, detail="Publication not found")
    return publication


@router.put("/{publication_id}")
def update_publication(
    publication_id: int,
    publication: PublicationCreate,
    current_user: User = Depends(require_permission("publication:update")),
    db: Session = Depends(get_db),
):
    existing = db.query(Publication).filter(Publication.id == publication_id).first()
    if existing is None:
        raise HTTPException(status_code=404, detail="Publication not found")
    require_publication_owner(existing, current_user)
    validate_selected_reviewer(publication.selected_reviewer_id, existing.researcher_id, db)
    publication_data = publication.model_dump()
    publication_data["doi"] = publication_data.get("doi") or None
    for field, value in publication_data.items():
        setattr(existing, field, value)
    existing.status = "Pending Review" if publication.selected_reviewer_id else "Draft"
    existing.reviewed_by = existing.reviewed_at = existing.review_comments = None
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
    if publication is None:
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
    safe_name = f"{current_user.id}_{os.path.basename(file.filename)}"
    folder = "uploads/papers"
    os.makedirs(folder, exist_ok=True)
    file_path = os.path.join(folder, safe_name)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    return {"filename": safe_name, "pdf_url": f"/uploads/papers/{safe_name}"}
