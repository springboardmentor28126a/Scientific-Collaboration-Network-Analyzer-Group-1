from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .models import User
from .routes import auth

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Scientific Collaboration Network API",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
app.include_router(auth.router)

@app.get("/")
def read_root():
    return {"message": "API Running", "docs": "/docs"}

@app.get("/health")
def health():
    return {"status": "healthy"}