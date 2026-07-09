
from sqlalchemy.orm import Session

from app.models.researcher_model import Researcher


def create_researcher(
    db: Session,
    user_id: int,
    institution: str,
    department: str,
    research_interest: str,
    bio: str
):
    researcher = Researcher(
        user_id=user_id,
        institution=institution,
        department=department,
        research_interest=research_interest,
        bio=bio
    )

    db.add(researcher)
    db.commit()
    db.refresh(researcher)

    return researcher