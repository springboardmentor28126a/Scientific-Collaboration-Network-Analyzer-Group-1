from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from backend.database.database import get_db
from backend.utils.dependencies import require_permission
from backend.database.models import Publication, User, Institution, Conference, Citation
from backend.models.friend_request import FriendRequest
from backend.models.meeting import Meeting

router = APIRouter(
    prefix="/analytics",
    tags=["Analytics"]
)


@router.get("/overview")
def analytics_overview(
    current_user=Depends(require_permission("analytics:view")),
    db: Session = Depends(get_db),
):
    total_researchers = db.query(User).count()
    total_publications = db.query(Publication).count()
    total_institutions = db.query(Institution).count()
    total_conferences = db.query(Conference).count()

    publications_by_year = {
        year: count
        for year, count in db.query(
            Publication.publication_year,
            func.count(Publication.id)
        )
        .group_by(Publication.publication_year)
        .order_by(Publication.publication_year)
        .all()
    }

    publication_types = {
        publication_type: count
        for publication_type, count in db.query(
            Publication.publication_type,
            func.count(Publication.id)
        )
        .group_by(Publication.publication_type)
        .order_by(func.count(Publication.id).desc())
        .all()
    }

    top_institutions = [
        {"institution": institution, "publications": count}
        for institution, count in db.query(
            Institution.name,
            func.count(Publication.id)
        )
        .join(Publication, Publication.institution_id == Institution.id)
        .group_by(Institution.name)
        .order_by(func.count(Publication.id).desc())
        .limit(5)
        .all()
    ]

    top_researchers = [
        {"researcher": name, "publications": count}
        for name, count in db.query(
            User.name,
            func.count(Publication.id)
        )
        .join(Publication, Publication.researcher_id == User.id)
        .group_by(User.name)
        .order_by(func.count(Publication.id).desc())
        .limit(5)
        .all()
    ]

    conference_participation = [
        {"conference": name, "publications": count}
        for name, count in db.query(
            Conference.name,
            func.count(Publication.id)
        )
        .join(Publication, Publication.conference_id == Conference.id)
        .group_by(Conference.name)
        .order_by(func.count(Publication.id).desc())
        .limit(5)
        .all()
    ]

    research_growth = [
        {"year": year, "count": count}
        for year, count in publications_by_year.items()
    ]

    publication_status = {
        status: count
        for status, count in db.query(Publication.status, func.count(Publication.id))
        .group_by(Publication.status).all()
    }
    department_publications = [
        {"department": department or "Unspecified", "publications": count}
        for department, count in db.query(User.department, func.count(Publication.id))
        .join(Publication, Publication.researcher_id == User.id)
        .group_by(User.department).order_by(func.count(Publication.id).desc()).limit(10).all()
    ]
    reviewer_performance = [
        {"reviewer": name, "reviewed": count}
        for name, count in db.query(User.name, func.count(Publication.id))
        .join(Publication, Publication.reviewed_by == User.id)
        .group_by(User.id, User.name).order_by(func.count(Publication.id).desc()).limit(10).all()
    ]
    citation_trends = [
        {"year": year, "citations": count}
        for year, count in db.query(Publication.publication_year, func.count(Citation.id))
        .join(Citation, Citation.cited_publication_id == Publication.id)
        .group_by(Publication.publication_year).order_by(Publication.publication_year).all()
    ]
    collaboration_growth = [
        {"year": year, "collaborations": count}
        for year, count in db.query(func.extract("year", FriendRequest.created_at), func.count(FriendRequest.id))
        .filter(FriendRequest.status == "Accepted")
        .group_by(func.extract("year", FriendRequest.created_at))
        .order_by(func.extract("year", FriendRequest.created_at)).all()
    ]
    conference_statistics = [
        {"conference": name, "publications": count}
        for name, count in conference_participation
    ]
    latest_publications = [
        {"id": item.id, "title": item.title, "year": item.publication_year, "status": item.status}
        for item in db.query(Publication).order_by(Publication.uploaded_at.desc()).limit(8).all()
    ]
    research_interests = {}
    for interests, in db.query(User.research_interests).filter(User.research_interests.isnot(None)).all():
        for interest in interests.split(","):
            key = interest.strip()
            if key:
                research_interests[key] = research_interests.get(key, 0) + 1

    return {
        "total_researchers": total_researchers,
        "total_publications": total_publications,
        "total_institutions": total_institutions,
        "total_conferences": total_conferences,
        "publications_by_year": publications_by_year,
        "publication_types": publication_types,
        "top_institutions": top_institutions,
        "top_researchers": top_researchers,
        "conference_participation": conference_participation,
        "research_growth": research_growth,
        "publication_status": publication_status,
        "department_publications": department_publications,
        "reviewer_performance": reviewer_performance,
        "top_reviewers": reviewer_performance,
        "research_interests": dict(sorted(research_interests.items(), key=lambda item: item[1], reverse=True)[:10]),
        "citation_trends": citation_trends,
        "collaboration_growth": collaboration_growth,
        "conference_statistics": conference_statistics,
        "latest_publications": latest_publications,
    }


@router.get("/network")
def analytics_network(
    current_user=Depends(require_permission("analytics:view")),
    db: Session = Depends(get_db),
):
    institutions = db.query(Institution).all()
    researchers = db.query(User).all()
    publications = db.query(Publication).all()
    conferences = db.query(Conference).all()

    nodes = []
    edges = []

    for institution in institutions:
        nodes.append({
            "id": f"institution-{institution.id}",
            "label": institution.name,
            "type": "institution",
        })

    for researcher in researchers:
        nodes.append({
            "id": f"researcher-{researcher.id}",
            "label": researcher.name,
            "type": "researcher",
        })
        if researcher.institution_id:
            edges.append({
                "source": f"institution-{researcher.institution_id}",
                "target": f"researcher-{researcher.id}",
                "type": "affiliated_with",
            })

    for publication in publications:
        nodes.append({
            "id": f"publication-{publication.id}",
            "label": publication.title,
            "type": "publication",
        })
        if publication.researcher_id:
            edges.append({
                "source": f"researcher-{publication.researcher_id}",
                "target": f"publication-{publication.id}",
                "type": "authored",
            })
        if publication.institution_id:
            edges.append({
                "source": f"institution-{publication.institution_id}",
                "target": f"publication-{publication.id}",
                "type": "published_by",
            })
        if publication.conference_id:
            edges.append({
                "source": f"conference-{publication.conference_id}",
                "target": f"publication-{publication.id}",
                "type": "presented_at",
            })

    for conference in conferences:
        nodes.append({
            "id": f"conference-{conference.id}",
            "label": conference.name,
            "type": "conference",
        })

    return {
        "nodes": nodes,
        "edges": edges,
    }
