from fastapi import APIRouter
from database import SessionLocal
import models

router = APIRouter(
    prefix="/report",
    tags=["Reports"]
)


@router.get("/summary")
def get_summary():

    db = SessionLocal()

    total_researchers = (
        db.query(models.User)
        .filter(models.User.role == "Researcher")
        .count()
    )

    total_publications = db.query(models.Publication).count()

    total_conferences = db.query(models.Conference).count()

    total_collaborations = db.query(models.Collaboration).count()

    total_projects = db.query(models.Project).count()

    db.close()

    return {
        "total_researchers": total_researchers,
        "total_publications": total_publications,
        "total_conferences": total_conferences,
        "total_collaborations": total_collaborations,
        "total_projects": total_projects
    }