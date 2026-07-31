from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

import os

from database import Base, engine
import models

# Routers
from auth import router as auth_router
from researcher import router as researcher_router
from publication import router as publication_router
from conference import router as conference_router
from collaboration import router as collaboration_router
from project import router as project_router
from review import router as review_router
from institution import router as institution_router
from file_upload import router as file_router
from dashboard import router as dashboard_router
from analytics import router as analytics_router
from search import router as search_router
from export import router as export_router
from citation import router as citation_router
import report

# Create database tables
Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="Scientific Collaboration Network Analyzer",
    description="""
    API documentation for Scientific Collaboration Network Analyzer.

    Modules:
    - Authentication
    - Researcher Management
    - Publication Management
    - Conference Management
    - Project Management
    - Collaboration Management
    - Review Management
    - Institution Management
    - File Upload Management
    """,
    version="1.0.0"
)


# -----------------------------
# Upload Folder
# -----------------------------

UPLOAD_FOLDER = "uploads"

if not os.path.exists(UPLOAD_FOLDER):
    os.mkdir(UPLOAD_FOLDER)


app.mount(
    "/uploads",
    StaticFiles(directory=UPLOAD_FOLDER),
    name="uploads"
)



# -----------------------------
# CORS
# -----------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3002",
        "http://localhost:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



# -----------------------------
# Include Routers
# -----------------------------

app.include_router(auth_router)
app.include_router(analytics_router)

app.include_router(researcher_router)

app.include_router(publication_router)

app.include_router(conference_router)

app.include_router(collaboration_router)

app.include_router(project_router)

app.include_router(review_router)

app.include_router(institution_router)

app.include_router(file_router)

app.include_router(dashboard_router)

app.include_router(search_router)
app.include_router(export_router)
app.include_router(citation_router)
app.include_router(report.router)
# -----------------------------
# Home
# -----------------------------

@app.get("/", tags=["Home"])
def home():
    return {
        "message": "Scientific Collaboration Network Analyzer API Running"
    }



@app.get("/health", tags=["Home"])
def health_check():
    return {
        "status": "active"
    }
# Test change