from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.researcher import Researcher
from app.schemas.researcher import ResearcherCreate
from app.schemas.researcher import ResearcherUpdate
from app.models.user import User
from app.utils.constants import UserStatus

def create_researcher(
    db: Session,
    researcher: ResearcherCreate,
):
    db_researcher = Researcher(
        user_id=researcher.user_id,
        institution_id=researcher.institution_id,
        department_id=researcher.department_id,
        first_name=researcher.first_name,
        last_name=researcher.last_name,
        designation=researcher.designation,
        qualification=researcher.qualification,
        research_interests=researcher.research_interests,
        skills=researcher.skills,
        biography=researcher.biography,
        profile_image=researcher.profile_image,
    )

    db.add(db_researcher)
    db.commit()
    db.refresh(db_researcher)

    return db_researcher
def get_all_researchers(db: Session):
    return (
        db.query(Researcher)
        .join(User, User.id == Researcher.user_id)
        .filter(User.status == UserStatus.APPROVED)
        .all()
    )
def get_researcher_by_id(
    db: Session,
    researcher_id: int,
):
    researcher = (
        db.query(Researcher)
        .filter(Researcher.id == researcher_id)
        .first()
    )

    if not researcher:
        raise HTTPException(
            status_code=404,
            detail="Researcher not found",
        )

    return researcher
def update_researcher(
    db: Session,
    researcher_id: int,
    researcher_data: ResearcherUpdate,
):
    researcher = (
        db.query(Researcher)
        .filter(Researcher.id == researcher_id)
        .first()
    )

    if not researcher:
        raise HTTPException(
            status_code=404,
            detail="Researcher not found",
        )

    update_data = researcher_data.model_dump(
        exclude_unset=True
    )

    for key, value in update_data.items():
        setattr(researcher, key, value)

    db.commit()
    db.refresh(researcher)

    return researcher
def delete_researcher(
    db: Session,
    researcher_id: int,
):
    researcher = (
        db.query(Researcher)
        .filter(Researcher.id == researcher_id)
        .first()
    )

    if not researcher:
        raise HTTPException(
            status_code=404,
            detail="Researcher not found",
        )

    db.delete(researcher)
    db.commit()

    return {
        "message": "Researcher deleted successfully"
    }