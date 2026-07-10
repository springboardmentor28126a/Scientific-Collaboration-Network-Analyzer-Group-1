from fastapi.middleware.cors import CORSMiddleware
from app.routers.researcher_profile_router import router as researcher_router
from fastapi import FastAPI
from app.routers.user_router import router
from app.database import Base, engine
from app.models.user_model import User
from app.models.institution_model import Institution
from app.models.department_model import Department
from app.models.researcher_profile_model import ResearcherProfile

Base.metadata.create_all(bind=engine)

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)
app.include_router(researcher_router)

@app.get("/")
def home():
    return {
        "message": "Welcome to Scientific Collaboration Network Analyzer"
    }