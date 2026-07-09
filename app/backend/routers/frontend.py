from pathlib import Path

from fastapi import APIRouter, Request
from fastapi.templating import Jinja2Templates

APP_DIR = Path(__file__).resolve().parents[2]
TEMPLATES_DIR = APP_DIR / "frontend" / "templates"

templates = Jinja2Templates(directory=str(TEMPLATES_DIR))
templates.env.cache = None

router = APIRouter(tags=["Frontend"])


@router.get("/")
def home_page(request: Request):
    return templates.TemplateResponse(
        request,
        "home.html",
        {
            "title": "Dashboard",
        },
    )


@router.get("/dashboard")
def dashboard_page(request: Request):
    return templates.TemplateResponse(
        request,
        "home.html",
        {
            "title": "Dashboard",
        },
    )


@router.get("/researchers-page")
def researchers_page(request: Request):
    return templates.TemplateResponse(
        request,
        "researchers.html",
        {
            "title": "Researchers",
        },
    )


@router.get("/publications-page")
def publications_page(request: Request):
    return templates.TemplateResponse(
        request,
        "publications.html",
        {
            "title": "Publications",
        },
    )


@router.get("/collaborations-page")
def collaborations_page(request: Request):
    return templates.TemplateResponse(
        request,
        "collaborations.html",
        {
            "title": "Collaborations",
        },
    )


@router.get("/reports-page")
def reports_page(request: Request):
    return templates.TemplateResponse(
        request,
        "reports.html",
        {
            "title": "Reports",
        },
    )


@router.get("/login")
def login_page(request: Request):
    return templates.TemplateResponse(
        request,
        "login.html",
        {
            "title": "Login",
        },
    )


@router.get("/register")
def register_page(request: Request):
    return templates.TemplateResponse(
        request,
        "register.html",
        {
            "title": "Register",
        },
    )


@router.get("/account")
def account_page(request: Request):
    return templates.TemplateResponse(
        request,
        "account.html",
        {
            "title": "Account",
        },
    )
