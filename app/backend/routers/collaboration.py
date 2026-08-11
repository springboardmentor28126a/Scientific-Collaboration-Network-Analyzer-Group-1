from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func
from sqlalchemy.orm import Session
from datetime import datetime
from collections import OrderedDict

from app.backend.utils.permissions import require_role, get_current_user
from app.backend.database.database import get_db
from app.backend.models.collaboration import Collaboration, PublicationAuthor
from app.backend.models.publication import Publication
from app.backend.models.researcher import Researcher
from app.backend.models.audit import AuditLog
from app.backend.schemas.collaboration import (
    CollaborationCreate,
    CollaborationResponse,
    PublicationAuthorCreate,
    PublicationAuthorResponse,
)
from app.backend.routers.audit import log_audit_event
from app.backend.routers.notification import create_notification

router = APIRouter(
    prefix="/collaborations",
    tags=["Collaborations"]
)


# ======================================================
# Collaboration CRUD
# ======================================================

@router.post("/", response_model=CollaborationResponse)
def create_collaboration(
    collaboration: CollaborationCreate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_role(
            "Admin",
            "System Admin"
        )
    ),
):
    new_collaboration = Collaboration(**collaboration.model_dump())

    db.add(new_collaboration)
    db.commit()
    db.refresh(new_collaboration)

    log_audit_event(
        db,
        "Create Collaboration",
        "Collaboration",
        f"Created collaboration '{new_collaboration.title}' ({new_collaboration.collaboration_type})",
        current_user.get("id")
    )
    create_notification(
        db,
        "New Collaboration Created",
        f"Collaboration '{new_collaboration.title}' has been formed.",
        None,
        "collaboration"
    )

    return new_collaboration


@router.get("/", response_model=list[CollaborationResponse])
def list_collaborations(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1),
    db: Session = Depends(get_db),
    current_user=Depends(
        get_current_user
    )
):
    skip = (page - 1) * limit
    return db.query(Collaboration).offset(skip).limit(limit).all()


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
    current_user=Depends(
        require_role(
            "Admin",
            "System Admin"
        )
    ),
):
    new_author = PublicationAuthor(**author.model_dump())

    db.add(new_author)
    db.commit()
    db.refresh(new_author)

    log_audit_event(
        db,
        "Add Co-Author",
        "Collaboration",
        f"Added researcher ID {author.researcher_id} as author to publication ID {author.publication_id}",
        current_user.get("id")
    )

    return new_author


@router.get(
    "/publication-authors",
    response_model=list[PublicationAuthorResponse]
)
def list_publication_authors(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1),
    db: Session = Depends(get_db),
    current_user=Depends(
        get_current_user
    )
):
    skip = (page - 1) * limit
    return db.query(PublicationAuthor).offset(skip).limit(limit).all()


# ======================================================
# Dashboard Summary
# ======================================================

@router.get("/dashboard")
def collaboration_dashboard(
    db: Session = Depends(get_db),
    current_user=Depends(
        get_current_user
    )
):
    # Same "what actually reflects real activity" fix as elsewhere: the
    # Collaboration table isn't what the Add Collaboration UI writes to,
    # PublicationAuthor is.
    total_collaborations = db.query(PublicationAuthor).count()

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
# Monthly Collaboration Trend
# ======================================================

@router.get("/monthly-trend")
def collaboration_monthly_trend(
    months: int = Query(6, ge=1, le=24),
    db: Session = Depends(get_db),
    current_user=Depends(
        get_current_user
    )
):
    # Collaboration/PublicationAuthor rows have no created_at column, so a
    # real month-by-month trend isn't derivable from those tables directly.
    # Every collaboration create (and co-author add) already writes a real,
    # timestamped AuditLog row with module="Collaboration" -- reusing that
    # existing data instead of adding a new column gives an actual trend
    # instead of synthetic numbers.
    today = datetime.utcnow().replace(day=1)

    # Build the last `months` YYYY-MM buckets in chronological order.
    buckets = OrderedDict()
    cursor = today
    keys = []
    for _ in range(months):
        keys.append(cursor.strftime("%Y-%m"))
        prev_month = cursor.month - 1 or 12
        prev_year = cursor.year - 1 if cursor.month == 1 else cursor.year
        cursor = cursor.replace(year=prev_year, month=prev_month)
    keys.reverse()
    for key in keys:
        buckets[key] = 0

    logs = (
        db.query(AuditLog)
        .filter(AuditLog.module == "Collaboration")
        .all()
    )

    for log in logs:
        if not log.created_at:
            continue
        month_key = log.created_at[:7]  # ISO timestamp -> "YYYY-MM"
        if month_key in buckets:
            buckets[month_key] += 1

    return {
        "labels": list(buckets.keys()),
        "counts": list(buckets.values()),
    }


# ======================================================
# Recent Collaborations
# ======================================================

@router.get("/recent")
def recent_collaborations(
    page: int = Query(1, ge=1),
    limit: int = Query(6, ge=1),
    db: Session = Depends(get_db),
    current_user=Depends(
        get_current_user
    )
):
    # Pagination added on top of the existing "recent" endpoint (same
    # page/limit shape used by the other modules, e.g. /institutions/search)
    # instead of introducing a new one, so the Collaboration module's
    # pagination matches the rest of the app.
    skip = (page - 1) * limit

    authors = (

        db.query(PublicationAuthor)

        .order_by(PublicationAuthor.id.desc())

        .offset(skip)

        .limit(limit)

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

            "id": author.id,

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

                author.contribution,

            # Extra fields for the "View Details" modal -- additive only,
            # existing consumers of this endpoint that only read the four
            # fields above are unaffected.
            "institution":

                researcher.institution if researcher else None,

            "publication_year":

                publication.publication_year if publication else None,

            "status":

                publication.status if publication else None,

        })

    return data


# ======================================================
# Collaboration Network
# ======================================================

@router.get("/network")
def get_collaboration_network(
    db: Session = Depends(get_db),
    current_user=Depends(
        get_current_user
    )
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


@router.get("/{collaboration_id}", response_model=CollaborationResponse)
def get_collaboration(
    collaboration_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        get_current_user
    )
):

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
# ---------------------------------------------------------------------------
# Additive search/sort/pagination endpoint (does not replace list_collaborations)
# ---------------------------------------------------------------------------
@router.get("/search/filter", response_model=list[CollaborationResponse])
def filter_collaborations(
    query: str = Query("", description="Case-insensitive match on title or institution name"),
    sort_by: str = Query("title", pattern="^(title|status|collaboration_type)$"),
    order: str = Query("asc", pattern="^(asc|desc)$"),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    q = db.query(Collaboration)

    if query:
        like = f"%{query.lower()}%"
        q = q.filter(
            func.lower(Collaboration.title).like(like)
            | func.lower(func.coalesce(Collaboration.institution_name, "")).like(like)
        )

    sort_column = getattr(Collaboration, sort_by)
    q = q.order_by(sort_column.desc() if order == "desc" else sort_column.asc())

    skip = (page - 1) * limit
    return q.offset(skip).limit(limit).all()