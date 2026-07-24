from pathlib import Path

from fastapi import APIRouter, Depends, Query, Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.researcher import Researcher

# -------------------------------------------------
# Template Configuration
# -------------------------------------------------

PROJECT_ROOT = Path(__file__).resolve().parents[4]
TEMPLATES_DIR = PROJECT_ROOT / "frontend" / "templates"

templates = Jinja2Templates(directory=str(TEMPLATES_DIR))

router = APIRouter(tags=["Search"])


# ==========================================================
# Search Page
# ==========================================================

@router.get("/search-page", response_class=HTMLResponse)
def search_page(
    request: Request,
    query: str = "",
    db: Session = Depends(get_db)
):

    researchers = []

    if query.strip():

        researchers = (
            db.query(Researcher)
            .filter(
                Researcher.full_name.ilike(f"%{query}%")
            )
            .all()
        )
    
    print("TEMPLATE DIRECTORY:", TEMPLATES_DIR)
    print("TEMPLATE OBJECT:", templates)
    print("TEMPLATE CACHE TYPE:", type(templates.env.cache))
    return templates.TemplateResponse(
    request=request,
    name="search.html",
    context={
        "title": "Search",
        "query": query,
        "researchers": researchers,
    }
)

# ==========================================================
# Search API (Database Only)
# ==========================================================

@router.get("/search")
def search_researchers(
    query: str = Query(...),
    db: Session = Depends(get_db)
):

    researchers = (
        db.query(Researcher)
        .filter(
            Researcher.full_name.ilike(f"%{query}%")
        )
        .all()
    )

    results = []

    for researcher in researchers:

        results.append(
            {
                "id": researcher.id,
                "full_name": researcher.full_name,
                "institution": researcher.institution,
                "department": researcher.department,
                "research_interest": researcher.research_interest,
                "skills": researcher.skills,
                "affiliations": researcher.affiliations,
            }
        )

    return {
        "results": results
    }
