from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from backend.database.database import Base, engine
import backend.database.models

from backend.routers.auth import router as auth_router
from backend.routers.researcher import router as researcher_router
from backend.routers.publication import router as publication_router
from backend.routers import collaboration
from backend.routers import chat
from backend.routers import analytics
from backend.routers import search
from backend.routers import dashboard
from backend.routers import conference
from backend.routers import institution


app = FastAPI(
    title="Scientific Collaboration Network Analyzer",
    description="Research Collaboration Management Platform",
    version="1.0.0"
)

os.makedirs("uploads/papers", exist_ok=True)

app.mount(
    "/uploads",
    StaticFiles(directory="uploads"),
    name="uploads"
)

# Create database tables
Base.metadata.create_all(bind=engine)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth_router)
app.include_router(researcher_router)
app.include_router(publication_router)
app.include_router(collaboration.router)
app.include_router(chat.router)
app.include_router(dashboard.router)
app.include_router(analytics.router)
app.include_router(search.router)

app.include_router(
    conference.router,
    prefix="/conference",
    tags=["Conference"]
)

app.include_router(
    institution.router,
    prefix="/institution",
    tags=["Institution"]
)


@app.get("/")
def home():
    return {
        "message": "Scientific Collaboration Network Analyzer API is Running Successfully"
    }