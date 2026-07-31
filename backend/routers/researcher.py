from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import or_
from backend.schemas.researcher import ResearcherCreate, ResearcherResponse
from backend.database.database import get_db
from backend.database.models import User, Publication, Conference

router = APIRouter(
    prefix="/researcher",
    tags=["Researcher"]
)

@router.get("/all")
def get_all_researchers(
    db: Session = Depends(get_db)
):

    users = db.query(User).all()

    result = []

    for user in users:

        result.append({

            "id": user.id,

            "name": user.name,

            "email": user.email,

            "role": user.role,

            "institution": user.institution_name or "",
            "aishe_code": user.aishe_code or "",
            "state": user.state or "",
            "district": user.district or "",
            "pincode": user.pincode or "",
            "institution_type": user.institution_type or "",

            "department": user.department or "",

            "research_interest": user.research_interests or "",

            "skills": user.skills or "",

            "country": user.country or "",

            "phone": user.phone or "",

            "designation": user.designation or "",

            "bio": user.bio or "",

            "linkedin": user.linkedin or "",

            "orcid": user.orcid or "",

            "google_scholar": user.google_scholar or ""

        })

    return result
@router.get("/search")
def search_researchers(
    q: str,
    db: Session = Depends(get_db)
):
    researchers = (
        db.query(User)
        .filter(
            or_(
                User.name.ilike(f"%{q}%"),
                User.email.ilike(f"%{q}%"),
                User.research_interests.ilike(f"%{q}%"),
                User.department.ilike(f"%{q}%"),
                User.institution_name.ilike(f"%{q}%")
            )
        )
        .limit(20)
        .all()
    )

    return researchers
# CREATE PROFILE
@router.post("/create", response_model=ResearcherResponse)
def create_profile(
    profile: ResearcherCreate,
    db: Session = Depends(get_db)
):

    user = db.query(User).filter(
        User.id == profile.user_id
    ).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User Not Found"
        )

    # Update user record with profile data
    user.phone = profile.phone
    user.department = profile.department
    user.institution_name = profile.institution
    user.aishe_code = profile.aishe_code
    user.state = profile.state
    user.district = profile.district
    user.pincode = profile.pincode
    user.institution_type = profile.institution_type
    user.designation = profile.designation
    user.research_interests = profile.research_interests
    user.skills = profile.skills
    user.bio = profile.bio
    user.country = profile.country
    user.linkedin = profile.linkedin
    user.orcid = profile.orcid
    user.google_scholar = profile.google_scholar

    db.commit()
    db.refresh(user)

    return {
        "id": user.id,
        "user_id": user.id,
        "phone": user.phone or "",
        "department": user.department or "",
        "institution": user.institution_name or "",
        "aishe_code": user.aishe_code or "",
        "state": user.state or "",
        "district": user.district or "",
        "pincode": user.pincode or "",
        "institution_type": user.institution_type or "",
        "designation": user.designation or "",
        "research_interests": user.research_interests or "",
        "skills": user.skills or "",
        "bio": user.bio or "",
        "linkedin": user.linkedin or "",
        "orcid": user.orcid or "",
        "google_scholar": user.google_scholar or "",
        "country": user.country or ""
    }

# GET PROFILE
@router.get("/{user_id}")
def get_profile(
    user_id: int,
    db: Session = Depends(get_db)
):

    user = db.query(User).filter(
        User.id == user_id
    ).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User Not Found"
        )

    publications = db.query(Publication).filter(
        Publication.researcher_id == user_id
    ).all()

    conference_ids = list(
        {
            publication.conference_id
            for publication in publications
            if publication.conference_id
        }
    )

    conferences = db.query(Conference).filter(
        Conference.id.in_(conference_ids)
    ).all() if conference_ids else []

    collaborators = []

    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role,
        "phone": user.phone or "",
        "institution": user.institution_name or "",
        "aishe_code": user.aishe_code or "",
        "state": user.state or "",
        "district": user.district or "",
        "pincode": user.pincode or "",
        "institution_type": user.institution_type or "",
        "department": user.department or "",
        "designation": user.designation or "",
        "research_interest": user.research_interests or "",
        "research_interests": user.research_interests or "",
        "skills": user.skills or "",
        "bio": user.bio or "",
        "country": user.country or "",
        "linkedin": user.linkedin or "",
        "orcid": user.orcid or "",
        "google_scholar": user.google_scholar or "",
        "profile_photo": "",
        "statistics": {
    "publications": len(publications),
    "conferences": len(conferences),
    "groups": 0
},
        "publications": [
            {
                "id": publication.id,
                "title": publication.title,
                "authors": publication.authors,
                "journal": publication.journal,
                "publication_year": publication.publication_year,
                "conference_id": publication.conference_id,
                "institution_id": publication.institution_id,
                "status": publication.status,
                "keywords": publication.keywords
            }
            for publication in publications
        ],
        "conferences": [
            {
                "id": conference.id,
                "name": conference.name,
                "location": conference.location,
                "start_date": conference.start_date,
                "end_date": conference.end_date
            }
            for conference in conferences
        ],
        "collaborators": [
            {
                "id": collaborator.id,
                "name": collaborator.name,
                "email": collaborator.email,
                "role": collaborator.role
            }
            for collaborator in collaborators
        ]
    }

# UPDATE PROFILE
@router.put("/{user_id}", response_model=ResearcherResponse)
def update_profile(
    user_id: int,
    profile: ResearcherCreate,
    db: Session = Depends(get_db)
):

    user = db.query(User).filter(
        User.id == user_id
    ).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User Not Found"
        )

    # Update user record with profile data
    user.phone = profile.phone
    user.department = profile.department
    user.institution_name = profile.institution
    user.aishe_code = profile.aishe_code
    user.state = profile.state
    user.district = profile.district
    user.pincode = profile.pincode
    user.institution_type = profile.institution_type
    user.designation = profile.designation
    user.research_interests = profile.research_interests
    user.skills = profile.skills
    user.bio = profile.bio
    user.country = profile.country
    user.linkedin = profile.linkedin
    user.orcid = profile.orcid
    user.google_scholar = profile.google_scholar

    db.commit()
    db.refresh(user)

    return {
        "id": user.id,
        "user_id": user.id,
        "phone": user.phone or "",
        "department": user.department or "",
        "institution": user.institution_name or "",
        "aishe_code": user.aishe_code or "",
        "state": user.state or "",
        "district": user.district or "",
        "pincode": user.pincode or "",
        "institution_type": user.institution_type or "",
        "designation": user.designation or "",
        "research_interests": user.research_interests or "",
        "skills": user.skills or "",
        "bio": user.bio or "",
        "linkedin": user.linkedin or "",
        "orcid": user.orcid or "",
        "google_scholar": user.google_scholar or "",
        "country": user.country or ""
    }


# DELETE PROFILE
@router.delete("/{user_id}")
def delete_profile(
    user_id: int,
    db: Session = Depends(get_db)
):

    user = db.query(User).filter(
        User.id == user_id
    ).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User Not Found"
        )

    # Reset profile fields instead of deleting user
    user.phone = ""
    user.department = ""
    user.institution_name = ""
    user.aishe_code = ""
    user.state = ""
    user.district = ""
    user.pincode = ""
    user.institution_type = ""
    user.designation = ""
    user.research_interests = ""
    user.skills = ""
    user.bio = ""
    user.country = ""
    user.linkedin = ""
    user.orcid = ""
    user.google_scholar = ""

    db.commit()

    return {
        "message": "Profile Deleted Successfully"
    }

