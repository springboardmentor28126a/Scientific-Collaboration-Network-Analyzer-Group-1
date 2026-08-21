import sys
import os

sys.path.append("src")

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv

from routes import (
    users,
    researcher,
    institution,
    department,
    publication,
    project,
    conference,
    collaboration,
    citation,
    audit,
    report,
    dashboard,
)

from routes.notifications import router as notifications_router

import models
from database import Base, engine


load_dotenv()


# =========================================================
# UPLOAD DIRECTORY
# =========================================================

BASE_DIR = os.path.dirname(
    os.path.abspath(__file__)
)

UPLOAD_DIR = os.path.join(
    BASE_DIR,
    "uploads"
)

os.makedirs(
    UPLOAD_DIR,
    exist_ok=True
)


# =========================================================
# FASTAPI APPLICATION
# =========================================================

app = FastAPI(
    title="Scientific Collaboration Network Analyzer"
)


# =========================================================
# DATABASE TABLE CREATION
# =========================================================

Base.metadata.create_all(
    bind=engine
)


# =========================================================
# CORS
# =========================================================

app.add_middleware(
    CORSMiddleware,

    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
        "http://localhost:5175",
        "http://127.0.0.1:5175",
    ],

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"],
)


# =========================================================
# STATIC FILES
# =========================================================
# Allows uploaded research documents to be opened through:
#
# http://127.0.0.1:8000/uploads/filename.pdf
#
# =========================================================

app.mount(
    "/uploads",
    StaticFiles(
        directory=UPLOAD_DIR
    ),
    name="uploads"
)


# =========================================================
# API ROUTES
# =========================================================

app.include_router(
    users.router
)

app.include_router(
    researcher.router
)

app.include_router(
    institution.router
)

app.include_router(
    department.router
)

app.include_router(
    publication.router
)

app.include_router(
    project.router
)

app.include_router(
    conference.router
)

app.include_router(
    collaboration.router
)

app.include_router(
    citation.router
)

app.include_router(
    audit.router
)

app.include_router(
    report.router
)

app.include_router(
    dashboard.router
)


# =========================================================
# NOTIFICATIONS
# =========================================================

app.include_router(
    notifications_router
)


# =========================================================
# ROOT
# =========================================================

@app.get("/")
def root():

    return {
        "message": "API running"
    }