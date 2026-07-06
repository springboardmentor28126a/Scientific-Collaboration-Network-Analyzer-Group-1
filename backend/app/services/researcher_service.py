from sqlalchemy.orm import Session

from app.models.researcher import Researcher
from app.schemas.researcher import ResearcherCreate


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