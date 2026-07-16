from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers.user_router import router as user_router
from app.routers.researcher_router import router as researcher_router
from app.routers.publication_router import router as publication_router
from app.routers.conference_router import router as conference_router
from app.routers.institution_router import router as institution_router
from app.routers.file_router import router as file_router

app = FastAPI()

# CORS Configuration
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(user_router)
app.include_router(researcher_router)
app.include_router(publication_router)
app.include_router(conference_router)
app.include_router(institution_router)
app.include_router(file_router)


@app.get("/")
def home():
    return {
        "message": "Welcome to Scientific Collaboration Network Analyzer"
    }
