import sys
sys.path.append("src")

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from routes import users, researcher, institution, department, conference, citations

import models

# Load environment variables
load_dotenv()


app = FastAPI(
    title="Scientific Collaboration Network Analyzer"
)


# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# API Routes

app.include_router(users.router)

app.include_router(researcher.router)

app.include_router(institution.router)

app.include_router(department.router)

app.include_router(conference.router)

app.include_router(citations.router)


# Root endpoint

@app.get("/")
def root():
    return {
        "message": "API running"
    }