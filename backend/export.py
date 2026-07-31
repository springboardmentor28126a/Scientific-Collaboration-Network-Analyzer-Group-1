from fastapi import APIRouter, Depends
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from database import get_db
import models
import csv

router = APIRouter(tags=["Export"])


@router.get("/export/publications")
def export_publications(db: Session = Depends(get_db)):

    publications = db.query(models.Publication).all()

    filename = "publications.csv"

    with open(filename, "w", newline="", encoding="utf-8") as file:
        writer = csv.writer(file)

        writer.writerow([
            "ID",
            "Title",
            "Author",
            "Journal",
            "Year",
            "Status",
        ])

        for publication in publications:
            writer.writerow([
                publication.id,
                publication.title,
                publication.author,
                publication.journal,
                publication.year,
                publication.status,
            ])

    return FileResponse(
        filename,
        media_type="text/csv",
        filename="publications.csv",
    )