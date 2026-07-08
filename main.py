from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware  

from database.database import Base, engine
from routers.publication import router as publication_router

app = FastAPI(
    title="Scientific Collaboration Network Analyzer",
    description="Research Collaboration Management Platform",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create all database tables
Base.metadata.create_all(bind=engine)

# Include Publication Router
app.include_router(publication_router)


@app.get("/")
def home():
    return {
        "message": "Scientific Collaboration Network Analyzer API is Running Successfully"
    }