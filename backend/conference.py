from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
import models

from schemas import (
    ConferenceCreate,
    ConferenceUpdate,
    ConferenceResponse
)

router = APIRouter(tags=["Conference"])


# -----------------------------
# CREATE Conference
# -----------------------------
@router.post("/conference")
def create_conference(
    conference: ConferenceCreate,
    db: Session = Depends(get_db)
):

    new_conference = models.Conference(
        name=conference.name,
        location=conference.location,
        date=conference.date,
        organizer=conference.organizer
    )

    db.add(new_conference)
    db.commit()
    db.refresh(new_conference)

    return {
        "message": "Conference added successfully",
        "conference": new_conference
    }


# -----------------------------
# GET All Conferences
# -----------------------------
@router.get("/conference", response_model=list[ConferenceResponse])
def get_all_conferences(db: Session = Depends(get_db)):
    return db.query(models.Conference).all()


# -----------------------------
# SEARCH Conference
# -----------------------------
@router.get("/conference/search")
def search_conference(
    name: str,
    db: Session = Depends(get_db)
):
    conferences = (
        db.query(models.Conference)
        .filter(models.Conference.name.ilike(f"%{name}%"))
        .all()
    )

    return conferences


# -----------------------------
# SORT Conference
# -----------------------------
@router.get("/conference/sort")
def sort_conference(
    order: str = "asc",
    db: Session = Depends(get_db)
):

    if order.lower() == "desc":
        conferences = (
            db.query(models.Conference)
            .order_by(models.Conference.name.desc())
            .all()
        )
    else:
        conferences = (
            db.query(models.Conference)
            .order_by(models.Conference.name.asc())
            .all()
        )

    return conferences


# -----------------------------
# GET Conference By ID
# -----------------------------
@router.get("/conference/{conference_id}", response_model=ConferenceResponse)
def get_conference(
    conference_id: int,
    db: Session = Depends(get_db)
):

    conference = (
        db.query(models.Conference)
        .filter(models.Conference.id == conference_id)
        .first()
    )

    if not conference:
        raise HTTPException(
            status_code=404,
            detail="Conference not found"
        )

    return conference


# -----------------------------
# UPDATE Conference
# -----------------------------
@router.put("/conference/{conference_id}")
def update_conference(
    conference_id: int,
    conference: ConferenceUpdate,
    db: Session = Depends(get_db)
):

    db_conference = (
        db.query(models.Conference)
        .filter(models.Conference.id == conference_id)
        .first()
    )

    if not db_conference:
        raise HTTPException(
            status_code=404,
            detail="Conference not found"
        )

    db_conference.name = conference.name
    db_conference.location = conference.location
    db_conference.date = conference.date
    db_conference.organizer = conference.organizer

    db.commit()
    db.refresh(db_conference)

    return {
        "message": "Conference updated successfully",
        "conference": db_conference
    }


# -----------------------------
# DELETE Conference
# -----------------------------
@router.delete("/conference/{conference_id}")
def delete_conference(
    conference_id: int,
    db: Session = Depends(get_db)
):

    conference = (
        db.query(models.Conference)
        .filter(models.Conference.id == conference_id)
        .first()
    )

    if not conference:
        raise HTTPException(
            status_code=404,
            detail="Conference not found"
        )

    db.delete(conference)
    db.commit()

    return {
        "message": "Conference deleted successfully"
    }