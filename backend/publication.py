from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
import models

from schemas import (
    PublicationCreate,
    PublicationUpdate,
    PublicationResponse
)

router = APIRouter(tags=["Publications"])


# -----------------------------
# CREATE Publication
# -----------------------------
@router.post("/publication")
def create_publication(
    publication: PublicationCreate,
    db: Session = Depends(get_db)
):

    new_publication = models.Publication(
        title=publication.title,
        author=publication.author,
        journal=publication.journal,
        year=publication.year,
        type=publication.type,
        status=publication.status
    )

    db.add(new_publication)
    db.commit()
    db.refresh(new_publication)

    return {
        "message": "Publication added successfully",
        "publication": new_publication
    }


# -----------------------------
# GET All Publications
# -----------------------------
@router.get(
    "/publication",
    response_model=list[PublicationResponse]
)
def get_all_publications(
    skip: int = 0,
    limit: int = 10,
    db: Session = Depends(get_db)
):
    publications = (
        db.query(models.Publication)
        .offset(skip)
        .limit(limit)
        .all()
    )

    return publications


# ======================================================
# SEARCH / FILTER / SORT
# ======================================================


# -----------------------------
# SEARCH Publication
# -----------------------------
@router.get("/publication/search")
def search_publication(
    title: str,
    skip: int = 0,
    limit: int = 10,
    db: Session = Depends(get_db)
):
    publications = (
        db.query(models.Publication)
        .filter(models.Publication.title.ilike(f"%{title}%"))
        .offset(skip)
        .limit(limit)
        .all()
    )

    return publications


# -----------------------------
# FILTER Publication
# -----------------------------
@router.get("/publication/filter")
def filter_publication(
    status: str,
    skip: int = 0,
    limit: int = 10,
    db: Session = Depends(get_db)
):
    publications = (
        db.query(models.Publication)
        .filter(models.Publication.status == status)
        .offset(skip)
        .limit(limit)
        .all()
    )

    return publications


# -----------------------------
# SORT Publication
# -----------------------------
@router.get("/publication/sort")
def sort_publication(
    order: str = "desc",
    skip: int = 0,
    limit: int = 10,
    db: Session = Depends(get_db)
):

    query = db.query(models.Publication)

    if order.lower() == "asc":
        query = query.order_by(
            models.Publication.year.asc()
        )
    else:
        query = query.order_by(
            models.Publication.year.desc()
        )

    return (
        query
        .offset(skip)
        .limit(limit)
        .all()
    )


# -----------------------------
# GET Publication By ID
# -----------------------------
@router.get(
    "/publication/{publication_id}",
    response_model=PublicationResponse
)
def get_publication(
    publication_id: int,
    db: Session = Depends(get_db)
):

    publication = (
        db.query(models.Publication)
        .filter(models.Publication.id == publication_id)
        .first()
    )

    if not publication:
        raise HTTPException(
            status_code=404,
            detail="Publication not found"
        )

    return publication


# -----------------------------
# UPDATE Publication
# -----------------------------
@router.put("/publication/{publication_id}")
def update_publication(
    publication_id: int,
    publication: PublicationUpdate,
    db: Session = Depends(get_db)
):

    db_publication = (
        db.query(models.Publication)
        .filter(models.Publication.id == publication_id)
        .first()
    )

    if not db_publication:
        raise HTTPException(
            status_code=404,
            detail="Publication not found"
        )

    db_publication.title = publication.title
    db_publication.author = publication.author
    db_publication.journal = publication.journal
    db_publication.year = publication.year
    db_publication.type = publication.type
    db_publication.status = publication.status

    db.commit()
    db.refresh(db_publication)

    return {
        "message": "Publication updated successfully",
        "publication": db_publication
    }


# -----------------------------
# DELETE Publication
# -----------------------------
@router.delete("/publication/{publication_id}")
def delete_publication(
    publication_id: int,
    db: Session = Depends(get_db)
):

    publication = (
        db.query(models.Publication)
        .filter(models.Publication.id == publication_id)
        .first()
    )

    if not publication:
        raise HTTPException(
            status_code=404,
            detail="Publication not found"
        )

    db.delete(publication)
    db.commit()

    return {
        "message": "Publication deleted successfully"
    }