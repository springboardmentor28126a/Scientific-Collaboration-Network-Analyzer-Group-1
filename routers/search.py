from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from database.database import get_db
from database.models import User, Publication, Institution, Conference

router = APIRouter(
    prefix="/search",
    tags=["Search"]
)


@router.get("/global")
def global_search(
    query: str = Query(..., min_length=1),
    db: Session = Depends(get_db)
):
    search_term = f"%{query.lower()}%"

    researchers = db.query(User).filter(
        User.name.ilike(search_term)
        | User.email.ilike(search_term)
        | User.department.ilike(search_term)
        | User.designation.ilike(search_term)
        | User.research_interests.ilike(search_term)
    ).all()

    publications = db.query(Publication).filter(
        Publication.title.ilike(search_term)
        | Publication.authors.ilike(search_term)
        | Publication.journal.ilike(search_term)
        | Publication.keywords.ilike(search_term)
        | Publication.doi.ilike(search_term)
    ).all()

    institutions = db.query(Institution).filter(
        Institution.name.ilike(search_term)
        | Institution.city.ilike(search_term)
        | Institution.state.ilike(search_term)
        | Institution.country.ilike(search_term)
    ).all()

    conferences = db.query(Conference).filter(
        Conference.name.ilike(search_term)
        | Conference.organizer.ilike(search_term)
        | Conference.location.ilike(search_term)
    ).all()

    return {
        "query": query,
        "researchers": researchers,
        "publications": publications,
        "institutions": institutions,
        "conferences": conferences,
    }
