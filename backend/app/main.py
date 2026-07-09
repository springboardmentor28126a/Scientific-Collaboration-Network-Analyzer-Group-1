from fastapi import FastAPI

from app.database import engine, Base
from app.models.user import User
from app.models.paper import Paper
from app.models.researcher import Researcher
from app.routers.auth import router as auth_router
from app.routers.paper import router as paper_router
from app.routers.researcher import router as researcher_router


Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Scientific Collaboration Network Analyzer API",
    version="1.0.0"
)
app.include_router(auth_router)
app.include_router(paper_router)
app.include_router(researcher_router)
@app.get("/")
def root():
    return {
        "message": "Welcome to Scientific Collaboration Network Analyzer"
    }