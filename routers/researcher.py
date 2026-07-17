from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database.database import get_db
from database.models import ResearcherProfile, User, Publication, Conference, Collaboration
from schemas.researcher import ResearcherCreate, ResearcherResponse

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

        profile = (
            db.query(ResearcherProfile)
            .filter(
                ResearcherProfile.user_id == user.id
            )
            .first()
        )

        result.append({

            "id": user.id,

            "name": user.name,

            "email": user.email,

            "role": user.role,

            "institution":
                profile.institution if profile else "",

            "department":
                profile.department if profile else "",

            "research_interest":
                profile.research_interest if profile else "",

            "skills":
                profile.skills if profile else "",

            "country":
                profile.country if profile else ""

        })

    return result

# CREATE PROFILE
@router.post("/create", response_model=ResearcherResponse)
def create_profile(
    profile: ResearcherCreate,
    db: Session = Depends(get_db)
):

    existing = db.query(ResearcherProfile).filter(
        ResearcherProfile.user_id == profile.user_id
    ).first()

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Profile already exists"
        )

    researcher = ResearcherProfile(
        user_id=profile.user_id,
        phone=profile.phone,
        department=profile.department,
        institution=profile.institution,
        designation=profile.designation,
        research_interest=profile.research_interest,
        skills=profile.skills,
        bio=profile.bio,
        linkedin=profile.linkedin,
        orcid=profile.orcid,
        google_scholar=profile.google_scholar
    )

    db.add(researcher)
    db.commit()
    db.refresh(researcher)

    return researcher


# READ PROFILE
# @router.get("/{user_id}", response_model=ResearcherResponse)
# def get_profile(
#     user_id: int,
#     db: Session = Depends(get_db)
# ):

#     researcher = db.query(ResearcherProfile).filter(
#         ResearcherProfile.user_id == user_id
#     ).first()

#     if not researcher:
#         raise HTTPException(
#             status_code=404,
#             detail="Profile Not Found"
#         )

#     return researcher
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

    profile = db.query(ResearcherProfile).filter(
        ResearcherProfile.user_id == user_id
    ).first()

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

    collaborations = db.query(Collaboration).filter(
        (Collaboration.user1_id == user_id) |
        (Collaboration.user2_id == user_id)
    ).all()

    collaborator_ids = {
        collaboration.user2_id
        if collaboration.user1_id == user_id
        else collaboration.user1_id
        for collaboration in collaborations
    }

    collaborators = db.query(User).filter(
        User.id.in_(collaborator_ids)
    ).all() if collaborator_ids else []

    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role,
        "phone": profile.phone if profile else "",
        "institution": profile.institution if profile else "",
        "department": profile.department if profile else "",
        "designation": profile.designation if profile else "",
        "research_interest": profile.research_interest if profile else "",
        "skills": profile.skills if profile else "",
        "bio": profile.bio if profile else "",
        "country": profile.country if profile else "",
        "linkedin": profile.linkedin if profile else "",
        "orcid": profile.orcid if profile else "",
        "google_scholar": profile.google_scholar if profile else "",
        "profile_photo": profile.profile_photo if profile else "",
        "statistics": {
            "publications": len(publications),
            "conferences": len(conferences),
            "collaborations": len(collaborators)
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

    researcher = db.query(ResearcherProfile).filter(
        ResearcherProfile.user_id == user_id
    ).first()

    if not researcher:
        raise HTTPException(
            status_code=404,
            detail="Profile Not Found"
        )

    researcher.phone = profile.phone
    researcher.department = profile.department
    researcher.institution = profile.institution
    researcher.designation = profile.designation
    researcher.research_interest = profile.research_interest
    researcher.skills = profile.skills
    researcher.bio = profile.bio
    researcher.linkedin = profile.linkedin
    researcher.orcid = profile.orcid
    researcher.google_scholar = profile.google_scholar

    db.commit()
    db.refresh(researcher)

    return researcher


# DELETE PROFILE
@router.delete("/{user_id}")
def delete_profile(
    user_id: int,
    db: Session = Depends(get_db)
):

    researcher = db.query(ResearcherProfile).filter(
        ResearcherProfile.user_id == user_id
    ).first()

    if not researcher:
        raise HTTPException(
            status_code=404,
            detail="Profile Not Found"
        )

    db.delete(researcher)
    db.commit()

    return {
        "message": "Profile Deleted Successfully"
    }

