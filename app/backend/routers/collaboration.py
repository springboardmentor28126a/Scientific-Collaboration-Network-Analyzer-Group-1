from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.backend.database.database import get_db
from app.backend.models.collaboration import Collaboration, PublicationAuthor
from app.backend.schemas.collaboration import (
    CollaborationCreate,
    CollaborationResponse,
    PublicationAuthorCreate,
    PublicationAuthorResponse,
)

router = APIRouter(prefix="/collaborations", tags=["Collaborations"])


@router.post("/", response_model=CollaborationResponse)
def create_collaboration(
    collaboration: CollaborationCreate,
    db: Session = Depends(get_db),
):
    new_collaboration = Collaboration(**collaboration.model_dump())
    db.add(new_collaboration)
    db.commit()
    db.refresh(new_collaboration)
    return new_collaboration


@router.get("/", response_model=list[CollaborationResponse])
def list_collaborations(db: Session = Depends(get_db)):
    return db.query(Collaboration).all()


@router.get("/network")
def get_collaboration_network(db: Session = Depends(get_db)):
    authors = db.query(PublicationAuthor).all()
    publications: dict[int, list[int]] = {}

    for author in authors:
        publications.setdefault(author.publication_id, []).append(author.researcher_id)

    edges = []
    for publication_id, researcher_ids in publications.items():
        unique_ids = sorted(set(researcher_ids))
        for index, source_id in enumerate(unique_ids):
            for target_id in unique_ids[index + 1:]:
                edges.append({
                    "source_researcher_id": source_id,
                    "target_researcher_id": target_id,
                    "publication_id": publication_id,
                })

    return {
        "nodes": sorted({author.researcher_id for author in authors}),
        "edges": edges,
    }


@router.post("/publication-authors", response_model=PublicationAuthorResponse)
def add_publication_author(
    author: PublicationAuthorCreate,
    db: Session = Depends(get_db),
):
    new_author = PublicationAuthor(**author.model_dump())
    db.add(new_author)
    db.commit()
    db.refresh(new_author)
    return new_author


@router.get("/publication-authors", response_model=list[PublicationAuthorResponse])
def list_publication_authors(db: Session = Depends(get_db)):
    return db.query(PublicationAuthor).all()


@router.get("/{collaboration_id}", response_model=CollaborationResponse)
def get_collaboration(collaboration_id: int, db: Session = Depends(get_db)):
    collaboration = db.query(Collaboration).filter(Collaboration.id == collaboration_id).first()
    if not collaboration:
        raise HTTPException(status_code=404, detail="Collaboration not found")
    return collaboration
