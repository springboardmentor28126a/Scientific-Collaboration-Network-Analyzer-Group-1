from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles


from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent

print("BASE_DIR =", BASE_DIR)
print("UPLOAD PATH =", BASE_DIR / "uploads")
print("EXISTS =", (BASE_DIR / "uploads").exists())

from app.database import engine, Base
from app.models.user import User
from app.models.paper import Paper
from app.models.researcher import Researcher
from app.models.conference import Conference
from app.models.institution import Institution
from app.routers.auth import router as auth_router
from app.routers.paper import router as paper_router
from app.routers.researcher import router as researcher_router
from app.routers.conference import router as conference_router
from app.routers.institution import router as institution_router


Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Scientific Collaboration Network Analyzer API",
    version="1.0.0"
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
    "http://localhost:5173",
    "http://localhost:5174",
],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(auth_router)
app.include_router(paper_router)
app.include_router(researcher_router)
app.include_router(conference_router)
app.include_router(institution_router)
from pathlib import Path
from fastapi.staticfiles import StaticFiles

BASE_DIR = Path(__file__).resolve().parent

app.mount(
    "/uploads",
    StaticFiles(directory=str(BASE_DIR / "uploads")),
    name="uploads",
)
@app.get("/")
def root():
    return {
        "message": "Welcome to Scientific Collaboration Network Analyzer"
    }