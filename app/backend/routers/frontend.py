import os
from pathlib import Path

from fastapi import APIRouter, Request
from fastapi.templating import Jinja2Templates

APP_DIR = Path(__file__).resolve().parents[2]
TEMPLATES_DIR = APP_DIR / "frontend" / "templates"

# Public Turnstile site key (safe to expose to the browser -- only the
# TURNSTILE_SECRET_KEY in utils/captcha.py must stay server-side). This
# project is server-rendered Jinja2, not Vite, so instead of a VITE_ build
# -time env var it's read here and passed into the login template.
TURNSTILE_SITE_KEY = os.getenv("TURNSTILE_SITE_KEY", "")

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


@router.get("/institutions-page")
def institutions_page(request: Request):
    return templates.TemplateResponse(
        request,
        "institutions.html",
        {
            "title": "Institutions",
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


@router.get("/conferences-page")
def conferences_page(request: Request):
    return templates.TemplateResponse(
        request,
        "conferences.html",
        {
            "title": "Conferences",
        },
    )


@router.get("/citations-page")
def citations_page(request: Request):
    return templates.TemplateResponse(
        request,
        "citations.html",
        {
            "title": "Citations",
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


@router.get("/ai-collaboration-page")
def ai_collaboration_page(request: Request):
    return templates.TemplateResponse(
        request,
        "ai_collaboration.html",
        {
            "title": "AI Collaboration",
        },
    )


@router.get("/login")
def login_page(request: Request):
    return templates.TemplateResponse(
        request,
        "login.html",
        {
            "title": "Login",
            "turnstile_site_key": TURNSTILE_SITE_KEY,
        },
    )


@router.get("/register")
def register_page(request: Request):
    return templates.TemplateResponse(
        request,
        "register.html",
        {
            "title": "Register",
            "turnstile_site_key": TURNSTILE_SITE_KEY,
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


@router.get("/audit-page")
def audit_page(request: Request):
    return templates.TemplateResponse(
        request,
        "audit.html",
        {
            "title": "Audit Logs",
        },
    )