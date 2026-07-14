from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database.database import Base, engine

import database.models

from routers.auth import router as auth_router
from routers.researcher import router as researcher_router
from routers.publication import router as publication_router
from routers import collaboration
from routers import chat
from fastapi.staticfiles import StaticFiles
import os
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
# Home
@app.get("/")
def home():
    return {
        "message": "Scientific Collaboration Network Analyzer API is Running Successfully"
    }