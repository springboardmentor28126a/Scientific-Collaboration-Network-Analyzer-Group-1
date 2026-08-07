from pathlib import Path

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

# Database
from app.backend.database.database import Base, engine

# Import models BEFORE create_all()
from app.backend.models.user import User
from app.backend.models.researcher import Researcher
from app.backend.models.publication import Publication
from app.backend.models.institution import Institution
from app.backend.models.collaboration import Collaboration, PublicationAuthor
from app.backend.models.project import ResearchProject, ProjectAssignment
from app.backend.models.conference import Conference, ConferenceParticipation
from app.backend.models.citation import Citation
from app.backend.models.audit import AuditLog
from app.backend.models.notification import Notification

# Import routers
from app.backend.routers import user
from app.backend.routers import researcher
from app.backend.routers import publication
from app.backend.routers import institution
from app.backend.routers import collaboration
from app.backend.routers import project
from app.backend.routers import conference
from app.backend.routers import citation
from app.backend.routers import audit
from app.backend.routers import dashboard
from app.backend.routers import report
from app.backend.routers import analytics
from app.backend.routers import frontend
from app.backend.routers import notification

# Create database tables
Base.metadata.create_all(bind=engine)

# Create FastAPI app
app = FastAPI(
    title="Scientific Collaboration Network Analyzer",
    version="1.0.0",
    description="Research collaboration management platform"
)

# Project paths
APP_DIR = Path(__file__).resolve().parent
FRONTEND_DIR = APP_DIR / "frontend"

# Serve static files
app.mount(
    "/static",
    StaticFiles(directory=FRONTEND_DIR / "static"),
    name="static"
)

# Register routers
app.include_router(frontend.router)
app.include_router(user.router)
app.include_router(researcher.router)
app.include_router(publication.router)
app.include_router(institution.router)
app.include_router(collaboration.router)
app.include_router(project.router)
app.include_router(conference.router)
app.include_router(citation.router)
app.include_router(audit.router)
app.include_router(dashboard.router)
app.include_router(report.router)
app.include_router(analytics.router)

app.include_router(notification.router)


@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "ok"}