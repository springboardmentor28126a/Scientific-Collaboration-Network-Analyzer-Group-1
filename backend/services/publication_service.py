from sqlalchemy.orm import Session
from database.models import Publication


def get_all_publications(db: Session):
    return db.query(Publication).all()


def create_publication(db: Session, publication):
    db.add(publication)
    db.commit()
    db.refresh(publication)
    return publication