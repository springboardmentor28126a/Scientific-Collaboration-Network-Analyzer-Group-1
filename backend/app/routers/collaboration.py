from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.paper import Paper
from app.models.researcher import Researcher
from app.models.researcher_paper import ResearcherPaper

router = APIRouter(
    prefix="/collaboration",
    tags=["Collaboration"]
)
@router.post("/assign")
def assign_researchers(
    paper_id: int,
    researcher_ids: list[int],
    db: Session = Depends(get_db)
):
    paper = db.query(Paper).filter(Paper.id == paper_id).first()

    if not paper:
        raise HTTPException(
            status_code=404,
            detail="Paper not found"
        )

    for researcher_id in researcher_ids:
        researcher = db.query(Researcher).filter(Researcher.id == researcher_id).first()

        if not researcher:
            raise HTTPException(
                status_code=404,
                detail=f"Researcher with ID {researcher_id} not found"
            )

        # Check if the relationship already exists
        existing_relationship = db.query(ResearcherPaper).filter(
            ResearcherPaper.researcher_id == researcher_id,
            ResearcherPaper.paper_id == paper_id
        ).first()

        if existing_relationship:
            continue  # Skip if the relationship already exists

        # Create a new relationship
        new_relationship = ResearcherPaper(
            researcher_id=researcher_id,
            paper_id=paper_id
        )
        db.add(new_relationship)

    db.commit()

    return {
        "message": "Researchers assigned to the paper successfully"
    }

@router.get("/paper/{paper_id}")
def get_paper_researchers(
    paper_id: int,
    db: Session = Depends(get_db)
):
    paper = db.query(Paper).filter(Paper.id == paper_id).first()

    if not paper:
        raise HTTPException(
            status_code=404,
            detail="Paper not found"
        )

    researchers = (
        db.query(Researcher)
        .join(
            ResearcherPaper,
            Researcher.id == ResearcherPaper.researcher_id
        )
        .filter(
            ResearcherPaper.paper_id == paper_id
        )
        .all()
    )

    return researchers

@router.get("/network")
def collaboration_network(
    db: Session = Depends(get_db)
):
    links = []

    papers = db.query(Paper).all()

    for paper in papers:

        researchers = (
            db.query(Researcher)
            .join(
                ResearcherPaper,
                Researcher.id == ResearcherPaper.researcher_id
            )
            .filter(
                ResearcherPaper.paper_id == paper.id
            )
            .all()
        )

        for i in range(len(researchers)):
            for j in range(i + 1, len(researchers)):

                links.append(
    {
        "source": researchers[i].name,
        "target": researchers[j].name,
        "paper": paper.title,

        "source_details": {
            "id": researchers[i].id,
            "name": researchers[i].name,
            "department": researchers[i].department,
            "university": researchers[i].university,
            "designation": researchers[i].designation,
            "research_interests": researchers[i].research_interests,
            "skills": researchers[i].skills,
            "experience": researchers[i].experience,
        },

        "target_details": {
            "id": researchers[j].id,
            "name": researchers[j].name,
            "department": researchers[j].department,
            "university": researchers[j].university,
            "designation": researchers[j].designation,
            "research_interests": researchers[j].research_interests,
            "skills": researchers[j].skills,
            "experience": researchers[j].experience,
        }
    }
)

    return links