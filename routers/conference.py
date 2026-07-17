from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database.database import get_db
from database.models import Conference, ConferenceMeetingDetails, Publication, User, Institution
from schemas.conference import (
    ConferenceCreate,
    ConferenceUpdate,
    ConferenceResponse
)

router = APIRouter()

def conference_to_response(conference: Conference) -> ConferenceResponse:
    meeting = conference.meeting_details
    return ConferenceResponse(
        id=conference.id,
        name=conference.name,
        organizer=conference.organizer,
        location=conference.location,
        start_date=conference.start_date,
        end_date=conference.end_date,
        website=conference.website,
        description=conference.description,
        meeting_details={
            "conference_type": meeting.conference_type if meeting else "Physical",
            "meeting_platform": meeting.meeting_platform if meeting else None,
            "meeting_link": meeting.meeting_link if meeting else None,
            "meeting_id": meeting.meeting_id if meeting else None,
            "passcode": meeting.passcode if meeting else None,
            "host_name": meeting.host_name if meeting else None,
            "time_zone": meeting.time_zone if meeting else None,
            "joining_instructions": meeting.joining_instructions if meeting else None,
        } if meeting else None,
    )

@router.post(
    "/",
    response_model=ConferenceResponse
)
def create_conference(
    conference: ConferenceCreate,
    db: Session = Depends(get_db)
):

    conference_data = conference.model_dump()
    meeting_details = conference_data.pop("meeting_details", None)

    new_conference = Conference(
        **conference_data
    )

    db.add(new_conference)
    db.commit()
    db.refresh(new_conference)

    if meeting_details:
        new_meeting_details = ConferenceMeetingDetails(
            conference_id=new_conference.id,
            **meeting_details
        )
        db.add(new_meeting_details)
        db.commit()
        db.refresh(new_meeting_details)
        db.refresh(new_conference)

    return conference_to_response(new_conference)


@router.get(
    "/",
    response_model=list[ConferenceResponse]
)
def get_conferences(
    db: Session = Depends(get_db)
):

    conference_list = db.query(Conference).all()
    return [conference_to_response(conference) for conference in conference_list]


@router.get(
    "/{conference_id}",
    response_model=ConferenceResponse
)
def get_conference(
    conference_id: int,
    db: Session = Depends(get_db)
):

    conference = db.query(
        Conference
    ).filter(
        Conference.id == conference_id
    ).first()

    if not conference:

        raise HTTPException(
            status_code=404,
            detail="Conference not found"
        )

    return conference_to_response(conference)


@router.get(
    "/details/{conference_id}"
)
def conference_details(
    conference_id: int,
    db: Session = Depends(get_db)
):

    conference = db.query(Conference).filter(
        Conference.id == conference_id
    ).first()

    if not conference:
        raise HTTPException(
            status_code=404,
            detail="Conference not found"
        )

    publications = db.query(Publication).filter(
        Publication.conference_id == conference_id
    ).all()

    researcher_ids = list(
        {
            publication.researcher_id
            for publication in publications
            if publication.researcher_id
        }
    )

    institution_ids = list(
        {
            publication.institution_id
            for publication in publications
            if publication.institution_id
        }
    )

    researchers = db.query(User).filter(
        User.id.in_(researcher_ids)
    ).all() if researcher_ids else []

    institutions = db.query(Institution).filter(
        Institution.id.in_(institution_ids)
    ).all() if institution_ids else []

    return {
        "conference": {
            "id": conference.id,
            "name": conference.name,
            "organizer": conference.organizer,
            "location": conference.location,
            "start_date": conference.start_date,
            "end_date": conference.end_date,
            "website": conference.website,
            "description": conference.description,
            "conference_type": conference.meeting_details.conference_type if conference.meeting_details else "Physical",
            "meeting_platform": conference.meeting_details.meeting_platform if conference.meeting_details else None,
            "meeting_link": conference.meeting_details.meeting_link if conference.meeting_details else None,
            "meeting_id": conference.meeting_details.meeting_id if conference.meeting_details else None,
            "passcode": conference.meeting_details.passcode if conference.meeting_details else None,
            "host_name": conference.meeting_details.host_name if conference.meeting_details else None,
            "time_zone": conference.meeting_details.time_zone if conference.meeting_details else None,
            "joining_instructions": conference.meeting_details.joining_instructions if conference.meeting_details else None
        },
        "statistics": {
            "publications": len(publications),
            "researchers": len(researchers),
            "institutions": len(institutions)
        },
        "publications": [
            {
                "id": publication.id,
                "title": publication.title,
                "authors": publication.authors,
                "journal": publication.journal,
                "publication_year": publication.publication_year,
                "institution_id": publication.institution_id,
                "researcher_id": publication.researcher_id
            }
            for publication in publications
        ],
        "researchers": [
            {
                "id": researcher.id,
                "name": researcher.name,
                "email": researcher.email
            }
            for researcher in researchers
        ],
        "institutions": [
            {
                "id": institution.id,
                "name": institution.name,
                "city": institution.city,
                "country": institution.country
            }
            for institution in institutions
        ]
    }
@router.put(
    "/{conference_id}",
    response_model=ConferenceResponse
)
def update_conference(
    conference_id: int,
    updated_data: ConferenceUpdate,
    db: Session = Depends(get_db)
):

    conference = db.query(
        Conference
    ).filter(
        Conference.id == conference_id
    ).first()

    if not conference:

        raise HTTPException(
            status_code=404,
            detail="Conference not found"
        )

    payload = updated_data.model_dump()
    meeting_details = payload.pop("meeting_details", None)

    for key, value in payload.items():
        setattr(
            conference,
            key,
            value
        )

    if meeting_details is not None:
        existing_meeting = db.query(ConferenceMeetingDetails).filter(
            ConferenceMeetingDetails.conference_id == conference_id
        ).first()

        if existing_meeting:
            for key, value in meeting_details.items():
                setattr(existing_meeting, key, value)
        else:
            new_meeting_details = ConferenceMeetingDetails(
                conference_id=conference_id,
                **meeting_details
            )
            db.add(new_meeting_details)

    db.commit()
    db.refresh(conference)

    return conference_to_response(conference)
@router.delete(
    "/{conference_id}"
)
def delete_conference(
    conference_id: int,
    db: Session = Depends(get_db)
):

    conference = db.query(
        Conference
    ).filter(
        Conference.id == conference_id
    ).first()

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