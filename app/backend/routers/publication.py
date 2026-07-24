from fastapi import HTTPException
from datetime import datetime
from app.backend.models.collaboration import PublicationAuthor
from fastapi.responses import FileResponse
from fastapi import APIRouter, Depends,Query
from fastapi import UploadFile, File, Form
import shutil
import os
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
    db: Session = Depends(get_db)
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
            upload_path = os.path.join("app/uploads", pdf_file.filename)
            with open(upload_path, "wb") as buffer:
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

    return new_publication

@router.get("/", response_model=list[PublicationResponse])
def list_publications(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1),
    sort_by: str = Query("id"),
    order: str = Query("asc"),
    db: Session = Depends(get_db)
):
    skip = (page - 1) * limit
    query = db.query(Publication)
    if hasattr(Publication, sort_by):
        column = getattr(Publication, sort_by)
        if order.lower() == "desc":
            query = query.order_by(column.desc())
        else:
            query = query.order_by(column.asc())
    return (
    query
    .offset(skip)
    .limit(limit)
    .all()
)
@router.get("/search", response_model=list[PublicationResponse])
def search_publications(
    title: str = Query(...),
    db: Session = Depends(get_db)
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
    limit: int = Query(2, ge=1),
    sort_by: str = Query("id"),
    order: str = Query("asc"),
    db: Session = Depends(get_db)
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

        upload_path = os.path.join(
            "app/uploads",
            pdf_file.filename
        )

        with open(upload_path, "wb") as buffer:
            shutil.copyfileobj(pdf_file.file, buffer)

        publication.upload_path = upload_path

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

    # Delete all related publication authors first
    db.query(PublicationAuthor).filter(
    PublicationAuthor.publication_id == publication_id
).delete()

# Now delete the publication
    db.delete(publication)

    db.commit()

    return {
        "message": "Publication deleted successfully"
    }

@router.get("/download/{publication_id}")
def download_publication_pdf(
    publication_id: int,
    db: Session = Depends(get_db)
):
    publication = (
        db.query(Publication)
        .filter(Publication.id == publication_id)
        .first()
    )

    if not publication:
        raise HTTPException(status_code=404, detail="Publication not found")

    if not publication.upload_path:
        raise HTTPException(status_code=404, detail="PDF not uploaded")

    file_path = os.path.join("app/uploads", publication.upload_path)
    return FileResponse(
    
    file_path,
    media_type="application/pdf",
    filename=os.path.basename(file_path)
)
    