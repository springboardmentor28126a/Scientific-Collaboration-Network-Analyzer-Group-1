from pathlib import Path

from fastapi import APIRouter, Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates

# ---------------------------------------------------------
# Template Configuration
# ---------------------------------------------------------

APP_DIR = Path(__file__).resolve().parents[2]

TEMPLATES_DIR = (
    APP_DIR /
    "frontend" /
    "templates"
)

templates = Jinja2Templates(
    directory=str(TEMPLATES_DIR)
)

# Disable template caching during development
templates.env.cache = None

router = APIRouter(
    tags=["Frontend"]
)


# ---------------------------------------------------------
# Helper Function
# ---------------------------------------------------------

def render(
    request: Request,
    template: str,
    title: str
):
    return templates.TemplateResponse(
        request=request,
        name=template,
        context={
            "title": title
        }
    )


# ---------------------------------------------------------
# Home
# ---------------------------------------------------------

@router.get(
    "/",
    response_class=HTMLResponse
)
def home_page(request: Request):
    return render(
        request,
        "home.html",
        "Dashboard"
    )


@router.get(
    "/dashboard",
    response_class=HTMLResponse
)
def dashboard_page(request: Request):
    return render(
        request,
        "home.html",
        "Dashboard"
    )


# ---------------------------------------------------------
# Authentication
# ---------------------------------------------------------

@router.get(
    "/login",
    response_class=HTMLResponse
)
def login_page(request: Request):
    return render(
        request,
        "login.html",
        "Login"
    )


@router.get(
    "/register",
    response_class=HTMLResponse
)
def register_page(request: Request):
    return render(
        request,
        "register.html",
        "Register"
    )


@router.get(
    "/account",
    response_class=HTMLResponse
)
def account_page(request: Request):
    return render(
        request,
        "account.html",
        "Account"
    )


# ---------------------------------------------------------
# Researchers
# ---------------------------------------------------------

@router.get(
    "/researchers-page",
    response_class=HTMLResponse
)
def researchers_page(request: Request):
    return render(
        request,
        "researchers.html",
        "Researchers"
    )


# ---------------------------------------------------------
# Institutions
# ---------------------------------------------------------

@router.get(
    "/institutions-page",
    response_class=HTMLResponse
)
def institutions_page(request: Request):
    return render(
        request,
        "institutions.html",
        "Institutions"
    )


# ---------------------------------------------------------
# Publications
# ---------------------------------------------------------

@router.get(
    "/publications-page",
    response_class=HTMLResponse
)
def publications_page(request: Request):
    return render(
        request,
        "publications.html",
        "Publications"
    )


# ---------------------------------------------------------
# Projects
# ---------------------------------------------------------

@router.get(
    "/projects-page",
    response_class=HTMLResponse
)
def projects_page(request: Request):
    return render(
        request,
        "projects.html",
        "Projects"
    )


# ---------------------------------------------------------
# Collaborations
# ---------------------------------------------------------

@router.get(
    "/collaborations-page",
    response_class=HTMLResponse
)
def collaborations_page(request: Request):
    return render(
        request,
        "collaborations.html",
        "Collaborations"
    )


# ---------------------------------------------------------
# Conferences
# ---------------------------------------------------------

@router.get(
    "/conferences-page",
    response_class=HTMLResponse
)
def conferences_page(request: Request):
    return render(
        request,
        "conferences.html",
        "Conferences"
    )


# ---------------------------------------------------------
# Reports
# ---------------------------------------------------------

@router.get(
    "/reports-page",
    response_class=HTMLResponse
)
def reports_page(request: Request):
    return render(
        request,
        "reports.html",
        "Reports"
    )


# ---------------------------------------------------------
# Search
# ---------------------------------------------------------

@router.get(
    "/search-page",
    response_class=HTMLResponse
)
def search_page(request: Request):
    return render(
        request,
        "search.html",
        "Search"
    )