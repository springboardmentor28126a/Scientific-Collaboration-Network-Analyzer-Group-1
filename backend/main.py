from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from app.core.config import settings
from app.database.session import engine
from app.database.base import Base

# Import models to register on Base
from app.models.conference import Conference
from app.models.institution import Institution
from app.models.file import UploadedFile
from app.models.user import User
from app.models.researcher import Researcher
from app.models.publication import Publication
from app.models.project import Project
from app.models.collaboration import Collaboration
from app.models.notification import Notification

# Create database tables automatically
Base.metadata.create_all(bind=engine)

# Run seeding on startup
from app.database.session import SessionLocal
from app.database.seed import seed_data
db = SessionLocal()
try:
    seed_data(db)
finally:
    db.close()

# Import routers
from app.routes.auth import router as auth_router
from app.routes.conferences import router as conferences_router
from app.routes.institutions import router as institutions_router
from app.routes.files import router as files_router
from app.routes.researchers import router as researchers_router
from app.routes.publications import router as publications_router
from app.routes.projects import router as projects_router
from app.routes.collaborations import router as collaborations_router
from app.routes.notifications import router as notifications_router

app = FastAPI(title="Scientific Collaboration Network Analyzer API", version="1.0.0")

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create uploads directory if it doesn't exist
upload_dir = settings.UPLOAD_DIRECTORY
if not os.path.isabs(upload_dir):
    base_dir = os.path.dirname(os.path.abspath(__file__))
    upload_dir = os.path.join(base_dir, upload_dir)
if not os.path.exists(upload_dir):
    os.makedirs(upload_dir)

# Mount static files folder to serve uploaded files
app.mount("/files", StaticFiles(directory=upload_dir), name="files")

# Include routers
app.include_router(auth_router)
app.include_router(conferences_router)
app.include_router(institutions_router)
app.include_router(files_router)
app.include_router(researchers_router)
app.include_router(publications_router)
app.include_router(projects_router)
app.include_router(collaborations_router)
app.include_router(notifications_router)

@app.get("/", tags=["Root"])
async def read_root():
    return {
        "message": "Welcome to the Scientific Collaboration Network Analyzer API!",
        "docs_url": "/docs"
    }
