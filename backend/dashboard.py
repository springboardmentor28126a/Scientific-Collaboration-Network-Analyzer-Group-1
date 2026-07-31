from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
import models

router = APIRouter(tags=["Dashboard"])


@router.get("/dashboard")
def dashboard(db: Session = Depends(get_db)):

    researchers = db.query(models.User).count()
    publications = db.query(models.Publication).count()
    conferences = db.query(models.Conference).count()
    collaborations = db.query(models.Collaboration).count()
    projects = db.query(models.Project).count()
    institutions = db.query(models.Institution).count()
    reviews = db.query(models.Review).count()

    return {
        "researchers": researchers,
        "publications": publications,
        "conferences": conferences,
        "collaborations": collaborations,
        "projects": projects,
        "institutions": institutions,
        "reviews": reviews
    }