from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import date

from app.database import get_db

from app.models.user import User
from app.models.researcher import Researcher
from app.models.paper import Paper
from app.models.conference import Conference
from app.models.institution import Institution
from app.models.project import Project
from app.models.team import Team
from app.models.citation import Citation
from app.models.reference import Reference
from app.models.institution_collaboration import InstitutionCollaboration


router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"]
)


# =========================================================
# GLOBAL DASHBOARD
# =========================================================

@router.get("/stats")
def get_dashboard_stats(
    db: Session = Depends(get_db)
):
    return {
        "researchers": db.query(Researcher).count(),
        "papers": db.query(Paper).count(),
        "conferences": db.query(Conference).count(),
        "institutions": db.query(Institution).count(),
        "projects": db.query(Project).count(),
        "teams": db.query(Team).count(),
        "citations": db.query(Citation).count(),
        "references": db.query(Reference).count()
    }


# =========================================================
# RESEARCHER DASHBOARD
# =========================================================

@router.get("/researcher")
def get_researcher_dashboard(
    email: str,
    db: Session = Depends(get_db)
):

    researcher = (
        db.query(Researcher)
        .filter(Researcher.email == email)
        .first()
    )

    if not researcher:
        researcher = (
            db.query(Researcher)
            .order_by(Researcher.id.asc())
            .first()
        )

    if not researcher:
        raise HTTPException(
            status_code=404,
            detail="No researcher profile exists in database"
        )

    # -----------------------------------------------------
    # MY PUBLICATIONS
    # -----------------------------------------------------

    my_papers = (
        db.query(Paper)
        .filter(
            Paper.researchers.any(
                Researcher.id == researcher.id
            )
        )
        .all()
    )

    my_publications_count = len(my_papers)

    # -----------------------------------------------------
    # MY CITATIONS
    # -----------------------------------------------------

    my_citations = (
        db.query(Citation)
        .join(
            Paper,
            Citation.paper_id == Paper.id
        )
        .filter(
            Paper.researchers.any(
                Researcher.id == researcher.id
            )
        )
        .all()
    )

    total_citations = sum(
        citation.citation_count or 0
        for citation in my_citations
    )

    # -----------------------------------------------------
    # MY COLLABORATORS
    # -----------------------------------------------------

    collaborators = set()

    for paper in my_papers:
        for author in paper.researchers:
            if author.id != researcher.id:
                collaborators.add(author.id)

    my_collaborators = []

    if collaborators:
        my_collaborators = (
            db.query(Researcher)
            .filter(
                Researcher.id.in_(
                    list(collaborators)
                )
            )
            .all()
        )

    # -----------------------------------------------------
    # UPCOMING CONFERENCES
    # -----------------------------------------------------

    upcoming_conferences = (
        db.query(Conference)
        .filter(
            Conference.conference_date >= date.today()
        )
        .order_by(
            Conference.conference_date.asc()
        )
        .limit(5)
        .all()
    )

    # -----------------------------------------------------
    # PUBLICATION STATISTICS
    # -----------------------------------------------------

    publication_statistics = {}

    for paper in my_papers:

        year = paper.publication_year

        if year is not None:

            if year not in publication_statistics:
                publication_statistics[year] = 0

            publication_statistics[year] += 1

    # -----------------------------------------------------
    # CITATION STATISTICS
    # -----------------------------------------------------

    citation_statistics = {}

    for citation in my_citations:

        year = citation.publication_year

        if year is not None:

            if year not in citation_statistics:
                citation_statistics[year] = 0

            citation_statistics[year] += (
                citation.citation_count or 0
            )

    # -----------------------------------------------------
    # RECENT PUBLICATIONS
    # -----------------------------------------------------

    recent_publications = sorted(
        my_papers,
        key=lambda paper: (
            paper.publication_year or 0
        ),
        reverse=True
    )[:5]

    # -----------------------------------------------------
    # RECOMMENDED RESEARCHERS
    # -----------------------------------------------------

    recommended_researchers = (
        db.query(Researcher)
        .filter(
            Researcher.id != researcher.id
        )
        .limit(5)
        .all()
    )

    return {

        "researcher": {
            "id": researcher.id,
            "name": researcher.name,
            "email": researcher.email,
            "university": researcher.university,
            "department": researcher.department
        },

        "my_publications":
            my_publications_count,

        "my_citations":
            total_citations,

        "my_collaborators":
            len(my_collaborators),

        "pending_collaboration_requests":
            0,

        "upcoming_conferences":
            len(upcoming_conferences),

        "publication_statistics":
            publication_statistics,

        "citation_statistics":
            citation_statistics,

        "recent_publications": [

            {
                "id": paper.id,
                "title": paper.title,
                "year": paper.publication_year,
                "journal": paper.journal,
                "status": paper.publication_status
            }

            for paper in recent_publications
        ],

        "recommended_researchers": [

            {
                "id": researcher_item.id,
                "name": researcher_item.name,
                "university": researcher_item.university,
                "department": researcher_item.department,
                "research_interests":
                    researcher_item.research_interests
            }

            for researcher_item
            in recommended_researchers
        ],

        "upcoming_conference_list": [

            {
                "id": conference.id,
                "name": conference.conference_name,
                "organizer": conference.organizer,
                "location": conference.location,
                "date": (
                    str(conference.conference_date)
                    if conference.conference_date
                    else None
                ),
                "status": conference.status
            }

            for conference
            in upcoming_conferences
        ]
    }


# =========================================================
# SUPER ADMIN DASHBOARD
# =========================================================

# =========================================================
# SUPER ADMIN DASHBOARD
# =========================================================

@router.get("/super-admin")
def get_super_admin_dashboard(
    db: Session = Depends(get_db)
):

    # -----------------------------------------------------
    # TOTAL USERS
    # -----------------------------------------------------

    total_users = db.query(User).count()

    # -----------------------------------------------------
    # TOTAL RESEARCHERS
    # -----------------------------------------------------

    total_researchers = db.query(Researcher).count()

    # -----------------------------------------------------
    # TOTAL INSTITUTIONS
    # -----------------------------------------------------

    total_institutions = db.query(Institution).count()

    # -----------------------------------------------------
    # TOTAL PUBLICATIONS
    # -----------------------------------------------------

    total_publications = db.query(Paper).count()

    # -----------------------------------------------------
    # TOTAL CITATIONS
    # -----------------------------------------------------

    total_citations = db.query(Citation).count()

    # -----------------------------------------------------
    # ACTIVE COLLABORATIONS
    # -----------------------------------------------------

    active_collaborations = (
        db.query(InstitutionCollaboration)
        .filter(
            InstitutionCollaboration.status == "Accepted"
        )
        .count()
    )

    # -----------------------------------------------------
    # PENDING PUBLICATION REVIEWS
    # -----------------------------------------------------

    pending_reviews = 0

    papers = db.query(Paper).all()

    for paper in papers:

        status = getattr(
            paper,
            "publication_status",
            None
        )

        status_text = str(
            status or ""
        ).strip().lower()

        reviewer_id = getattr(
            paper,
            "selected_reviewer_id",
            None
        )

        # A paper assigned to reviewer and not yet
        # approved/rejected is pending
        if (
            reviewer_id is not None
            and status_text not in [
                "approved",
                "rejected"
            ]
        ):
            pending_reviews += 1

    # -----------------------------------------------------
    # PENDING ROLE REQUESTS
    # -----------------------------------------------------
    #
    # Currently there is no separate role-request table
    # connected to this dashboard, so keep this safely at 0.
    #

    pending_role_requests = 0

    # -----------------------------------------------------
    # OTHER ANALYTICS
    # -----------------------------------------------------

    total_conferences = db.query(Conference).count()

    total_projects = db.query(Project).count()

    total_teams = db.query(Team).count()

    total_references = db.query(Reference).count()

    # -----------------------------------------------------
    # RETURN DATA
    # -----------------------------------------------------

    return {

        "total_users":
            total_users,

        "total_researchers":
            total_researchers,

        "total_institutions":
            total_institutions,

        "total_publications":
            total_publications,

        "pending_role_requests":
            pending_role_requests,

        "pending_reviews":
            pending_reviews,

        "total_citations":
            total_citations,

        "active_collaborations":
            active_collaborations,

        "system_activity":
            [],

        "overall_research_analytics": {

            "conferences":
                total_conferences,

            "projects":
                total_projects,

            "teams":
                total_teams,

            "references":
                total_references
        }
    }


# =========================================================
# REVIEWER DASHBOARD
# =========================================================

# =========================================================
# REVIEWER DASHBOARD
# =========================================================

@router.get("/reviewer")
def get_reviewer_dashboard(
    db: Session = Depends(get_db)
):

    # -----------------------------------------------------
    # PUBLICATION REVIEW COUNTS
    # -----------------------------------------------------

    papers = db.query(Paper).all()

    pending_publication_reviews = 0
    approved_publications = 0
    rejected_publications = 0

    recent_review_activity = []

    for paper in papers:

        status = getattr(
            paper,
            "publication_status",
            None
        )

        if status is None:
            status = getattr(
                paper,
                "status",
                None
            )

        status_text = str(
            status or ""
        ).strip().lower()

        # Reviewer assigned to this paper
        reviewer_id = getattr(
            paper,
            "selected_reviewer_id",
            None
        )

        # -------------------------------------------------
        # PENDING REVIEWS
        # -------------------------------------------------

        if reviewer_id is not None:

            if status_text not in [
                "approved",
                "published",
                "rejected"
            ]:
                pending_publication_reviews += 1

        # -------------------------------------------------
        # APPROVED / PUBLISHED
        # -------------------------------------------------

        if status_text in [
            "approved",
            "published"
        ]:
            approved_publications += 1

        # -------------------------------------------------
        # REJECTED
        # -------------------------------------------------

        if status_text == "rejected":
            rejected_publications += 1

        # -------------------------------------------------
        # RECENT ACTIVITY
        # -------------------------------------------------

        if status_text in [
            "approved",
            "published",
            "rejected"
        ]:
            recent_review_activity.append({
                "publication_id": paper.id,
                "title": paper.title,
                "status": status,
                "reviewer_id": reviewer_id
            })

    # -----------------------------------------------------
    # LIMIT RECENT ACTIVITY
    # -----------------------------------------------------

    recent_review_activity = sorted(
        recent_review_activity,
        key=lambda x: x["publication_id"],
        reverse=True
    )[:5]

    # -----------------------------------------------------
    # CITATION VERIFICATION
    # -----------------------------------------------------

    citations = db.query(Citation).all()

    pending_citation_verifications = 0
    verified_citations = 0
    rejected_citations = 0

    for citation in citations:

        citation_status = getattr(
            citation,
            "verification_status",
            None
        )

        if citation_status is None:
            citation_status = getattr(
                citation,
                "citation_status",
                None
            )

        if citation_status is None:
            citation_status = getattr(
                citation,
                "status",
                None
            )

        status_text = str(
            citation_status or ""
        ).strip().lower()

        # Pending
        if status_text in [
            "pending",
            "under review",
            "under_review"
        ]:
            pending_citation_verifications += 1

        # Verified
        elif status_text in [
            "verified",
            "approved"
        ]:
            verified_citations += 1

        # Rejected
        elif status_text == "rejected":
            rejected_citations += 1

    # -----------------------------------------------------
    # RETURN DASHBOARD DATA
    # -----------------------------------------------------

    return {
        "pending_publication_reviews":
            pending_publication_reviews,

        "pending_citation_verifications":
            pending_citation_verifications,

        "approved_publications":
            approved_publications,

        "rejected_publications":
            rejected_publications,

        "verified_citations":
            verified_citations,

        "rejected_citations":
            rejected_citations,

        "recent_review_activity":
            recent_review_activity
    }


# =========================================================
# INSTITUTION ADMIN DASHBOARD
# =========================================================

@router.get("/institution")
def get_institution_dashboard(
    institution_name: str,
    db: Session = Depends(get_db)
):

    # -----------------------------------------------------
    # FIND INSTITUTION
    # -----------------------------------------------------

    institution = (
        db.query(Institution)
        .filter(
            Institution.institution_name ==
            institution_name
        )
        .first()
    )

    if not institution:

        raise HTTPException(
            status_code=404,
            detail="Institution not found"
        )

    # -----------------------------------------------------
    # RESEARCHERS
    # -----------------------------------------------------

    researchers = (
        db.query(Researcher)
        .filter(
            Researcher.university ==
            institution.institution_name
        )
        .all()
    )

    researcher_ids = [
        r.id for r in researchers
    ]

    # -----------------------------------------------------
    # PUBLICATIONS
    # -----------------------------------------------------

    if researcher_ids:

        institution_papers = (
            db.query(Paper)
            .filter(
                Paper.researchers.any(
                    Researcher.id.in_(
                        researcher_ids
                    )
                )
            )
            .all()
        )

    else:

        institution_papers = []

    # -----------------------------------------------------
    # CITATIONS
    # -----------------------------------------------------

    paper_ids = [
        p.id for p in institution_papers
    ]

    if paper_ids:

        institution_citations = (
            db.query(Citation)
            .filter(
                Citation.paper_id.in_(
                    paper_ids
                )
            )
            .all()
        )

    else:

        institution_citations = []

    # -----------------------------------------------------
    # ACTIVE COLLABORATIONS
    # -----------------------------------------------------

    active_collaborations = (
        db.query(InstitutionCollaboration)
        .filter(
            InstitutionCollaboration.status ==
            "Accepted"
        )
        .count()
    )

    # -----------------------------------------------------
    # PENDING COLLABORATION REQUESTS
    # -----------------------------------------------------

    pending_requests = (
        db.query(InstitutionCollaboration)
        .filter(
            InstitutionCollaboration.status ==
            "Pending"
        )
        .count()
    )

    # -----------------------------------------------------
    # UPCOMING CONFERENCES
    # -----------------------------------------------------

    upcoming_conferences = (
        db.query(Conference)
        .filter(
            Conference.conference_date >= date.today()
        )
        .count()
    )

    # -----------------------------------------------------
    # RETURN
    # -----------------------------------------------------

    return {

        "institution": {

            "id":
                institution.id,

            "name":
                institution.institution_name,

            "type":
                institution.institution_type,

            "country":
                institution.country,

            "state":
                institution.state,

            "city":
                institution.city
        },

        "researchers":
            len(researchers),

        "publications":
            len(institution_papers),

        "citations":
            sum(
                citation.citation_count or 0
                for citation in institution_citations
            ),

        "active_collaborations":
            active_collaborations,

        "pending_requests":
            pending_requests,

        "upcoming_conferences":
            upcoming_conferences
    }