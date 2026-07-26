from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.backend.database.database import get_db
from app.backend.models.collaboration import Collaboration, PublicationAuthor
from app.backend.models.publication import Publication
from app.backend.models.researcher import Researcher
from app.backend.schemas.collaboration import (
    CollaborationCreate,
    CollaborationResponse,
    PublicationAuthorCreate,
    PublicationAuthorResponse,
)

router = APIRouter(prefix="/collaborations", tags=["Collaborations"])


# ======================================================
# Collaboration CRUD
# ======================================================

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


@router.get("/{collaboration_id}", response_model=CollaborationResponse)
def get_collaboration(collaboration_id: int, db: Session = Depends(get_db)):

    collaboration = (
        db.query(Collaboration)
        .filter(Collaboration.id == collaboration_id)
        .first()
    )

    if not collaboration:
        raise HTTPException(
            status_code=404,
            detail="Collaboration not found"
        )

    return collaboration


# ======================================================
# Publication Authors
# ======================================================

@router.post(
    "/publication-authors",
    response_model=PublicationAuthorResponse
)
def add_publication_author(
    author: PublicationAuthorCreate,
    db: Session = Depends(get_db),
):
    new_author = PublicationAuthor(**author.model_dump())

    db.add(new_author)
    db.commit()
    db.refresh(new_author)

    return new_author


@router.get(
    "/publication-authors",
    response_model=list[PublicationAuthorResponse]
)
def list_publication_authors(
    db: Session = Depends(get_db)
):
    return db.query(PublicationAuthor).all()


# ======================================================
# Dashboard Summary
# ======================================================

@router.get("/dashboard")
def collaboration_dashboard(
    db: Session = Depends(get_db)
):

    total_collaborations = db.query(Collaboration).count()

    connected_researchers = (
        db.query(
            func.count(
                func.distinct(
                    PublicationAuthor.researcher_id
                )
            )
        ).scalar()
        or 0
    )

    total_publications = (
        db.query(
            func.count(
                func.distinct(
                    PublicationAuthor.publication_id
                )
            )
        ).scalar()
        or 0
    )

    total_authors = db.query(PublicationAuthor).count()

    average_authors = (
        round(total_authors / total_publications, 2)
        if total_publications > 0
        else 0
    )

    return {

        "summary": {

            "total_collaborations": total_collaborations,

            "connected_researchers": connected_researchers,

            "average_authors": average_authors

        }

    }


# ======================================================
# Recent Collaborations
# ======================================================

@router.get("/recent")
def recent_collaborations(
    db: Session = Depends(get_db)
):

    authors = (

        db.query(PublicationAuthor)

        .order_by(PublicationAuthor.id.desc())

        .limit(10)

        .all()

    )

    data = []

    for author in authors:

        researcher = (

            db.query(Researcher)

            .filter(
                Researcher.id ==
                author.researcher_id
            )

            .first()

        )

        publication = (

            db.query(Publication)

            .filter(
                Publication.id ==
                author.publication_id
            )

            .first()

        )

        data.append({

            "publication":

                publication.title
                if publication
                else f"Publication {author.publication_id}",

            "researcher":

                researcher.full_name
                if researcher
                else f"Researcher {author.researcher_id}",

            "author_order":

                author.author_order,

            "contribution":

                author.contribution

        })

    return data


# ======================================================
# Collaboration Network
# ======================================================

@router.get("/network")
def get_collaboration_network(
    db: Session = Depends(get_db)
):

    authors = db.query(PublicationAuthor).all()

    publications = {}

    for author in authors:

        publications.setdefault(

            author.publication_id,

            []

        ).append(author.researcher_id)

    edges = []

    for publication_id, researcher_ids in publications.items():

        unique = sorted(set(researcher_ids))

        for i in range(len(unique)):

            for j in range(i + 1, len(unique)):

                edges.append({

                    "source": unique[i],

                    "target": unique[j]

                })

    nodes = [

        {

            "data": {

                "id": str(rid),

                "label": f"R{rid}"

            }

        }

        for rid in sorted({

            a.researcher_id

            for a in authors

        })

    ]

    edge_data = [

        {

            "data": {

                "source": str(e["source"]),

                "target": str(e["target"])

            }

        }

        for e in edges

    ]

    return {

        "nodes": nodes,

        "edges": edge_data

    }