from fastapi import APIRouter, Depends, HTTPException
from fastapi import UploadFile, File
from sqlalchemy.orm import Session

from pathlib import Path
import shutil
from app.database import get_db
from app.models.paper import Paper
from app.schemas.paper import PaperCreate, PaperUpdate


router = APIRouter(
    prefix="/papers",
    tags=["Research Papers"]
)
@router.post("/")
def create_paper(
    paper: PaperCreate,
    db: Session = Depends(get_db)
):

    new_paper = Paper(
    title=paper.title,
    abstract=paper.abstract,
    authors=paper.authors,
    keywords=paper.keywords,
    publication_year=paper.publication_year,
    journal=paper.journal,
    publication_type=paper.publication_type,
    publication_status=paper.publication_status,
    pdf_file=paper.pdf_file
)

    db.add(new_paper)
    db.commit()
    db.refresh(new_paper)

    return {
        "message": "Paper uploaded successfully"
    }
@router.get("/")
def get_all_papers(db: Session = Depends(get_db)):
    papers = db.query(Paper).all()
    return papers

@router.get("/{paper_id}")
def get_paper(
    paper_id: int,
    db: Session = Depends(get_db)
):
    paper = db.query(Paper).filter(Paper.id == paper_id).first()

    if not paper:
        raise HTTPException(
            status_code=404,
            detail="Paper not found"
        )

    return paper
@router.put("/{paper_id}")
def update_paper(
    paper_id: int,
    updated_paper: PaperUpdate,
    db: Session = Depends(get_db)
):

    paper = db.query(Paper).filter(Paper.id == paper_id).first()

    if not paper:
        raise HTTPException(
            status_code=404,
            detail="Paper not found"
        )

    paper.title = updated_paper.title
    paper.abstract = updated_paper.abstract
    paper.authors = updated_paper.authors
    paper.keywords = updated_paper.keywords
    paper.publication_year = updated_paper.publication_year
    paper.journal = updated_paper.journal
    paper.publication_type = updated_paper.publication_type
    paper.publication_status = updated_paper.publication_status
    paper.pdf_file = updated_paper.pdf_file

    db.commit()
    db.refresh(paper)

    return {
        "message": "Paper updated successfully"
    }
BASE_DIR = Path(__file__).resolve().parent.parent
UPLOAD_DIR = BASE_DIR / "uploads"

UPLOAD_DIR.mkdir(exist_ok=True)


@router.post("/upload")
def upload_pdf(file: UploadFile = File(...)):
    filename = file.filename.replace(" ", "_")
    file_path = UPLOAD_DIR / filename

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return {
        "file_path": f"uploads/{filename}"
    }

@router.delete("/{paper_id}")
def delete_paper(
    paper_id: int,
    db: Session = Depends(get_db)
):

    paper = db.query(Paper).filter(Paper.id == paper_id).first()

    if not paper:
        raise HTTPException(
            status_code=404,
            detail="Paper not found"
        )

    db.delete(paper)
    db.commit()

    return {
        "message": "Paper deleted successfully"
    }