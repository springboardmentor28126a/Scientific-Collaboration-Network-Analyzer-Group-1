from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from database import get_db
import models

router = APIRouter(tags=["Analytics"])


# -----------------------------
# Publication Status Analytics
# -----------------------------
@router.get("/analytics/publication-status")
def publication_status(db: Session = Depends(get_db)):

    result = (
        db.query(
            models.Publication.status,
            func.count(models.Publication.id)
        )
        .group_by(models.Publication.status)
        .all()
    )

    data = {}

    for status, count in result:
        data[status] = count

    return data


# -----------------------------
# Publication Year Analytics
# -----------------------------
@router.get("/analytics/publication-year")
def publication_year(db: Session = Depends(get_db)):

    result = (
        db.query(
            models.Publication.year,
            func.count(models.Publication.id)
        )
        .group_by(models.Publication.year)
        .order_by(models.Publication.year)
        .all()
    )

    data = {}

    for year, count in result:
        data[str(year)] = count

    return data
