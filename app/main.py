from pathlib import Path

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

from app.backend.routers import dashboard, frontend, institution, researcher, user

APP_DIR = Path(__file__).resolve().parent
STATIC_DIR = APP_DIR / "frontend" / "static"

app = FastAPI()
app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")

app.include_router(frontend.router)
app.include_router(user.router)
app.include_router(researcher.router)
app.include_router(institution.router)
app.include_router(dashboard.router)
