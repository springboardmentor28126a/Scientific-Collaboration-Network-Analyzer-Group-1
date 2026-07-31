from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
import models

router = APIRouter(tags=["Search"])


@router.get("/search")
def search(query: str, db: Session = Depends(get_db)):

    users = db.query(models.User).filter(
        models.User.username.ilike(f"%{query}%")
    ).all()

    publications = db.query(models.Publication).filter(
        models.Publication.title.ilike(f"%{query}%")
    ).all()

    conferences = db.query(models.Conference).filter(
        models.Conference.name.ilike(f"%{query}%")
    ).all()

    return {
        "users": [
            {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "role": user.role,
            }
            for user in users
        ],

        "publications": [
            {
                "id": publication.id,
                "title": publication.title,
                "author": publication.author,
                "journal": publication.journal,
                "year": publication.year,
                "status": publication.status,
            }
            for publication in publications
        ],

        "conferences": [
            {
                "id": conference.id,
                "name": conference.name,
                "location": conference.location,
                "date": conference.date,
                "organizer": conference.organizer,
            }
            for conference in conferences
        ],
    }