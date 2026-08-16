from fastapi import HTTPException
from datetime import datetime
from app.backend.models.collaboration import PublicationAuthor
from fastapi.responses import FileResponse
from fastapi import APIRouter, Depends, Query
from fastapi import UploadFile, File, Form
import shutil
import os
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.backend.utils.permissions import require_role, get_current_user
from app.backend.database.database import SessionLocal
from app.backend.models.publication import Publication
from app.backend.schemas.publication import PublicationCreate, PublicationResponse
from app.backend.routers.audit import log_audit_event
from app.backend.routers.notification import create_notification
from app.backend.models.citation import Citation

router = APIRouter(
    prefix="/publications",
    tags=["Publications"]
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=PublicationResponse)
async def create_publication(
    researcher_id: int = Form(...),
    title: str = Form(...),
    authors: str = Form(...),
    abstract: str = Form(None),
    citation_count: int = Form(0),
    publication_type: str = Form(...),
    publication_name: str = Form(...),
    publication_year: int = Form(...),
    doi: str = Form(None),
    status: str = Form("Draft"),
    pdf_file: UploadFile = File(None),
    db: Session = Depends(get_db),
    current_user=Depends(
        require_role(
            "Admin",
            "System Admin",
            "Institution Admin"
        )
    )
):
    current_year = datetime.now().year

    if publication_year > current_year:
        raise HTTPException(
            status_code=400,
            detail=f"Publication year cannot be greater than {current_year}"
        )

    if citation_count < 0:
        raise HTTPException(
            status_code=400,
            detail="Citation count cannot be negative"
        )

    upload_path = None

    if pdf_file and pdf_file.filename:
        if not pdf_file.filename.lower().endswith(".pdf"):
            raise HTTPException(
                status_code=400,
                detail="Only PDF files are allowed."
            )

        os.makedirs("app/uploads", exist_ok=True)
        upload_path = pdf_file.filename

        save_path = os.path.join(
            "app/uploads",
            upload_path
        )

        with open(save_path, "wb") as buffer:
            shutil.copyfileobj(pdf_file.file, buffer)

    new_publication = Publication(
        researcher_id=researcher_id,
        title=title,
        authors=authors,
        abstract=abstract,
        citation_count=citation_count,
        publication_type=publication_type,
        publication_name=publication_name,
        publication_year=publication_year,
        doi=doi,
        status=status,
        upload_path=upload_path
    )

    db.add(new_publication)
    db.commit()
    db.refresh(new_publication)

    log_audit_event(
        db,
        "Create Publication",
        "Publication History",
        f"Created publication '{title}' (ID: {new_publication.id})",
        current_user.get("id")
    )
    create_notification(
        db,
        "New Publication Added",
        f"New publication '{title}' ({publication_type}) was added by {authors}.",
        None,
        "publication"
    )

    return new_publication


@router.get("/", response_model=list[PublicationResponse])
def list_publications(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1),
    sort_by: str = Query("id"),
    order: str = Query("asc"),
    db: Session = Depends(get_db),
    current_user=Depends(
        get_current_user
    )
):
    skip = (page - 1) * limit
    query = db.query(Publication)

    if hasattr(Publication, sort_by):
        column = getattr(Publication, sort_by)
        if order.lower() == "desc":
            query = query.order_by(column.desc())
        else:
            query = query.order_by(column.asc())

    return query.offset(skip).limit(limit).all()


@router.get("/metrics/summary")
def publication_metrics_summary(
    db: Session = Depends(get_db),
    current_user=Depends(
        get_current_user
    )
):
    total = db.query(Publication).count()
    by_type = dict(
        db.query(Publication.publication_type, func.count(Publication.id))
        .group_by(Publication.publication_type)
        .all()
    )
    by_status = dict(
        db.query(Publication.status, func.count(Publication.id))
        .group_by(Publication.status)
        .all()
    )
    total_citations = db.query(func.sum(Publication.citation_count)).scalar() or 0

    recent = db.query(Publication).order_by(Publication.id.desc()).limit(5).all()

    return {
        "total_publications": total,
        "by_type": by_type,
        "by_status": by_status,
        "total_citations": total_citations,
        "recent_publications": [
            {
                "id": p.id,
                "title": p.title,
                "authors": p.authors,
                "publication_year": p.publication_year,
                "publication_type": p.publication_type,
                "status": p.status
            }
            for p in recent
        ]
    }


@router.get("/search", response_model=list[PublicationResponse])
def search_publications(
    title: str = Query(...),
    db: Session = Depends(get_db),
    current_user=Depends(
        get_current_user
    )
):
    publications = (
        db.query(Publication)
        .filter(Publication.title.ilike(f"%{title}%"))
        .all()
    )

    return publications
@router.get("/filter", response_model=list[PublicationResponse])
def filter_publications(
    publication_type: str | None = Query(None),
    status: str | None = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1),
    sort_by: str = Query("id"),
    order: str = Query("asc"),
    db: Session = Depends(get_db),
    current_user=Depends(
        get_current_user
    )
):
    query = db.query(Publication)
    skip = (page - 1) * limit

    if hasattr(Publication, sort_by):
        column = getattr(Publication, sort_by)
        if order.lower() == "desc":
            query = query.order_by(column.desc())
        else:
            query = query.order_by(column.asc())

    if publication_type:
        query = query.filter(
            Publication.publication_type.ilike(publication_type)
        )

    if status:
        query = query.filter(
            Publication.status.ilike(status)
        )

    return (
    query
    .offset(skip)
    .limit(limit)
    .all()
)

@router.get("/{publication_id}", response_model=PublicationResponse)
def get_publication(
    publication_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        get_current_user
    )
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
async def update_publication(
    publication_id: int,
    researcher_id: int = Form(...),
    title: str = Form(...),
    authors: str = Form(...),
    abstract: str = Form(None),
    citation_count: int = Form(0),
    publication_type: str = Form(...),
    publication_name: str = Form(...),
    publication_year: int = Form(...),
    doi: str = Form(None),
    status: str = Form("Draft"),
    pdf_file: UploadFile = File(None),
    db: Session = Depends(get_db),
    current_user=Depends(
        require_role(
            "Admin",
            "System Admin",
            "Institution Admin"
        )
    )
):
    publication = db.query(Publication).filter(
        Publication.id == publication_id
    ).first()

    if not publication:
        raise HTTPException(
            status_code=404,
            detail="Publication not found"
        )

    publication.researcher_id = researcher_id
    publication.title = title
    publication.authors = authors
    publication.abstract = abstract
    publication.citation_count = citation_count
    publication.publication_type = publication_type
    publication.publication_name = publication_name
    publication.publication_year = publication_year
    publication.doi = doi
    publication.status = status

    if pdf_file and pdf_file.filename:
        if not pdf_file.filename.lower().endswith(".pdf"):
            raise HTTPException(
                status_code=400,
                detail="Only PDF files are allowed."
            )

        os.makedirs("app/uploads", exist_ok=True)
        upload_path = pdf_file.filename

        save_path = os.path.join(
            "app/uploads",
            upload_path
        )

        with open(save_path, "wb") as buffer:
            shutil.copyfileobj(pdf_file.file, buffer)

        publication.upload_path = upload_path

    db.commit()
    db.refresh(publication)

    log_audit_event(
        db,
        "Update Publication",
        "Publication History",
        f"Updated publication '{title}' (ID: {publication.id})",
        current_user.get("id")
    )

    return publication


@router.delete("/{publication_id}")
def delete_publication(
    publication_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_role(
            "System Admin",
            "Admin"
        )
    )
):
    publication = db.query(Publication).filter(
        Publication.id == publication_id
    ).first()

    if not publication:
        raise HTTPException(
            status_code=404,
            detail="Publication not found"
        )

    title = publication.title

    db.query(PublicationAuthor).filter(
        PublicationAuthor.publication_id == publication_id
    ).delete()

    db.delete(publication)
    db.commit()

    log_audit_event(
        db,
        "Delete Publication",
        "Publication History",
        f"Deleted publication '{title}' (ID: {publication_id})",
        current_user.get("id")
    )

    return {
        "message": "Publication deleted successfully"
    }


@router.get("/download/{publication_id}")
def download_publication_pdf(
    publication_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        get_current_user
    )
):
    publication = (
        db.query(Publication)
        .filter(Publication.id == publication_id)
        .first()
    )

    if not publication:
        raise HTTPException(
            status_code=404,
            detail="Publication not found"
        )

    if not publication.upload_path:
        raise HTTPException(
            status_code=404,
            detail="PDF not uploaded"
        )

    file_path = os.path.join(
        "app/uploads",
        publication.upload_path
    )

    if not os.path.exists(file_path):
        raise HTTPException(
            status_code=404,
            detail="PDF file does not exist on server"
        )

    return FileResponse(
        file_path,
        media_type="application/pdf",
        filename=os.path.basename(file_path)
    )
@router.get("/{publication_id}/references")
def get_publication_references(
    publication_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    publication = (
        db.query(Publication)
        .filter(Publication.id == publication_id)
        .first()
    )

    if not publication:
        raise HTTPException(
            status_code=404,
            detail="Publication not found"
        )

    citations = (
        db.query(Citation)
        .filter(Citation.publication_id == publication_id)
        .all()
    )

    references = []

    for citation in citations:
        if citation.cited_publication_id:
            cited = (
                db.query(Publication)
                .filter(
                    Publication.id == citation.cited_publication_id
                )
                .first()
            )

            if cited:
                references.append({
                    "id": cited.id,
                    "title": cited.title
                })

    return references
