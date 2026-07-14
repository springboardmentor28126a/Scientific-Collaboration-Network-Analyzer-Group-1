from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .models import User, Institution, ResearcherProfile
from .routes import auth, researchers, institutions
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Scientific Collaboration Network API",
    description="Research collaboration management platform",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(researchers.router)
app.include_router(institutions.router)


@app.get("/")
def read_root():
    return {"message": "API Running", "docs": "/docs"}

@app.get("/health")
def health():
    return {"status": "healthy"}