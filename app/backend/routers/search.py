from pathlib import Path

from fastapi import (
    APIRouter,
    Depends,
    Query,
    Request,
    HTTPException
)
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates

from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.backend.database.database import get_db

from app.backend.models.researcher import Researcher
from app.backend.models.institution import Institution
from app.backend.models.publication import Publication
from app.backend.models.project import ResearchProject
from app.backend.models.conference import Conference

router = APIRouter(
    prefix="/search",
    tags=["Search"]
)

# ---------------------------------------------------------
# Template Configuration
# ---------------------------------------------------------

PROJECT_ROOT = Path(__file__).resolve().parents[4]

TEMPLATES_DIR = (
    PROJECT_ROOT
    / "frontend"
    / "templates"
)

templates = Jinja2Templates(
    directory=str(TEMPLATES_DIR)
)

# ---------------------------------------------------------
# Search Page
# ---------------------------------------------------------

@router.get(
    "/page",
    response_class=HTMLResponse
)
def search_page(
    request: Request,
    query: str = "",
    db: Session = Depends(get_db)
):

    researchers = []

    if len(query.strip()) >= 2:

        researchers = (
            db.query(Researcher)
            .filter(
                or_(
                    Researcher.full_name.ilike(
                        f"%{query}%"
                    ),
                    Researcher.department.ilike(
                        f"%{query}%"
                    ),
                    Researcher.institution.ilike(
                        f"%{query}%"
                    ),
                    Researcher.research_interest.ilike(
                        f"%{query}%"
                    )
                )
            )
            .all()
        )

    return templates.TemplateResponse(
        request=request,
        name="search.html",
        context={
            "title": "Global Search",
            "query": query,
            "researchers": researchers
        }
    )


# ---------------------------------------------------------
# Global Search API
# ---------------------------------------------------------

@router.get("/")
def global_search(
    query: str = Query(
        ...,
        min_length=2
    ),
    db: Session = Depends(get_db)
):

    keyword = query.strip()

    if not keyword:
        raise HTTPException(
            status_code=400,
            detail="Search query is required."
        )

    # -----------------------------------------------------
    # Researchers
    # -----------------------------------------------------

    researchers = (
        db.query(Researcher)
        .filter(
            or_(
                Researcher.full_name.ilike(
                    f"%{keyword}%"
                ),
                Researcher.department.ilike(
                    f"%{keyword}%"
                ),
                Researcher.institution.ilike(
                    f"%{keyword}%"
                ),
                Researcher.research_interest.ilike(
                    f"%{keyword}%"
                )
            )
        )
        .all()
    )

    researcher_results = []

    for researcher in researchers:

        researcher_results.append({

            "id":
                researcher.id,

            "full_name":
                researcher.full_name,

            "institution":
                researcher.institution,

            "department":
                researcher.department,

            "research_interest":
                researcher.research_interest,

            "skills":
                researcher.skills,

            "affiliations":
                researcher.affiliations

        })

    # -----------------------------------------------------
    # Institutions
    # -----------------------------------------------------

    institutions = (
        db.query(Institution)
        .filter(
            or_(
                Institution.name.ilike(
                    f"%{keyword}%"
                ),
                Institution.city.ilike(
                    f"%{keyword}%"
                ),
                Institution.country.ilike(
                    f"%{keyword}%"
                ),
                Institution.institution_type.ilike(
                    f"%{keyword}%"
                )
            )
        )
        .all()
    )

    institution_results = []

    for institution in institutions:

        institution_results.append({

            "id":
                institution.id,

            "name":
                institution.name,

            "type":
                institution.institution_type,

            "country":
                institution.country,

            "city":
                institution.city

        })
     # -----------------------------------------------------
    # Publications
    # -----------------------------------------------------

    publications = (
        db.query(Publication)
        .filter(
            or_(
                Publication.title.ilike(
                    f"%{keyword}%"
                ),
                Publication.authors.ilike(
                    f"%{keyword}%"
                ),
                Publication.publication_name.ilike(
                    f"%{keyword}%"
                ),
                Publication.doi.ilike(
                    f"%{keyword}%"
                )
            )
        )
        .all()
    )

    publication_results = []

    for publication in publications:

        publication_results.append({

            "id":
                publication.id,

            "title":
                publication.title,

            "authors":
                publication.authors,

            "publication_name":
                publication.publication_name,

            "publication_year":
                publication.publication_year,

            "status":
                publication.status

        })

    # -----------------------------------------------------
    # Projects
    # -----------------------------------------------------

    projects = (
        db.query(ResearchProject)
        .filter(
            or_(
                ResearchProject.title.ilike(
                    f"%{keyword}%"
                ),
                ResearchProject.status.ilike(
                    f"%{keyword}%"
                ),
                ResearchProject.funding_agency.ilike(
                    f"%{keyword}%"
                )
            )
        )
        .all()
    )

    project_results = []

    for project in projects:

        project_results.append({

            "id":
                project.id,

            "title":
                project.title,

            "status":
                project.status,

            "funding_agency":
                project.funding_agency,

            "start_date":
                project.start_date,

            "end_date":
                project.end_date

        })

    # -----------------------------------------------------
    # Conferences
    # -----------------------------------------------------

    conferences = (
        db.query(Conference)
        .filter(
            or_(
                Conference.name.ilike(
                    f"%{keyword}%"
                ),
                Conference.organizer.ilike(
                    f"%{keyword}%"
                ),
                Conference.location.ilike(
                    f"%{keyword}%"
                )
            )
        )
        .all()
    )

    conference_results = []

    for conference in conferences:

        conference_results.append({

            "id":
                conference.id,

            "name":
                conference.name,

            "organizer":
                conference.organizer,

            "location":
                conference.location,

            "start_date":
                conference.start_date,

            "end_date":
                conference.end_date

        })

    # -----------------------------------------------------
    # Final Response
    # -----------------------------------------------------

    return {

        "counts": {

            "researchers":
                len(researcher_results),

            "institutions":
                len(institution_results),

            "publications":
                len(publication_results),

            "projects":
                len(project_results),

            "conferences":
                len(conference_results)

        },

        "researchers":
            researcher_results,

        "institutions":
            institution_results,

        "publications":
            publication_results,

        "projects":
            project_results,

        "conferences":
            conference_results

    }       