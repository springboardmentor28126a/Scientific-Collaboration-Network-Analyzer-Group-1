from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database.database import get_db
from database.models import ResearcherProfile, User
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

        "profile_photo": profile.profile_photo if profile else ""

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

