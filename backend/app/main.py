from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from fastapi.openapi.utils import get_openapi
from .database import engine, Base, ensure_user_access_columns
from .models import User, ResearcherProfile, Institution
from .routes import auth, researchers, institutions, publications, conferences, reviews, admin, dashboard, collaborations, citations

Base.metadata.create_all(bind=engine)
ensure_user_access_columns()


app = FastAPI(
    title="Scientific Collaboration Network API",
    description="Research collaboration management platform",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(researchers.router)
app.include_router(institutions.router)
app.include_router(publications.router)
app.include_router(conferences.router)
app.include_router(reviews.router)
app.include_router(admin.router)
app.include_router(dashboard.router)
app.include_router(collaborations.router)
app.include_router(citations.router)

# Files are deliberately not publicly mounted.  Publication downloads go through
# an authenticated endpoint so private drafts and papers are not exposed by URL.
os.makedirs("uploads", exist_ok=True)



@app.get("/")
def read_root():
    return {
        "message": "Welcome to Scientific Collaboration Network API",
        "docs": "/docs",
        "redoc": "/redoc"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}
