from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
from app.api.user import router as user_router
from app.api.auth import router as auth_router
from app.api.researcher import router as researcher_router
from app.api.institution import router as institution_router
from app.api.department import router as department_router
from app.api.publication import router as publication_router
from app.api.conference import router as conference_router
from app.api.collaboration import router as collaboration_router
from app.api.citation import router as citation_router
from app.api.report import router as report_router
from app.api.analytics import router as analytics_router
from app.api.notification import router as notification_router
app = FastAPI(
    title="Scientific Collaboration Network Analyzer API",
    description="Backend API for managing researchers, publications, collaborations, conferences, and institutions.",
    version="1.0.0"
)
os.makedirs("uploads/publications", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Content-Disposition"],
)
app.include_router(user_router)
app.include_router(auth_router)
app.include_router(institution_router)
app.include_router(department_router)
app.include_router(researcher_router)
app.include_router(publication_router)
app.include_router(conference_router)
app.include_router(collaboration_router)
app.include_router(citation_router)
app.include_router(report_router)
app.include_router(analytics_router)
app.include_router(notification_router)
@app.get("/")
def root():
    return {
        "message": "Welcome to Scientific Collaboration Network Analyzer API"
    }
