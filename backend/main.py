from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
# from fastapi.staticfiles import StaticFiles
# import os

from backend.database.database import Base, engine
import backend.database.models
# Routers
from backend.routers.auth import router as auth_router
from backend.routers.researcher import router as researcher_router
from backend.routers.publication import router as publication_router
from backend.routers import chat
from backend.routers import analytics
from backend.routers import search
from backend.routers import dashboard
from backend.routers import conference
from backend.routers import institution
from backend.routers import meeting
from backend.routers import research_group
from backend.routers import group_invitation
from backend.routers import group_file
# Import models so SQLAlchemy creates tables
from backend.models.meeting import Meeting
from backend.models.research_group import ResearchGroup
from backend.models.research_group_member import ResearchGroupMember
from backend.models.group_invitation import GroupInvitation
from backend.models.group_file import GroupFile
from backend.models.direct_conversation import DirectConversation
from backend.models.direct_message import DirectMessage



app = FastAPI(
    title="Scientific Collaboration Network Analyzer",
    description="Research Collaboration Management Platform",
    version="1.0.0"
)

# Upload folder
# os.makedirs("uploads/papers", exist_ok=True)

# app.mount(
#     "/uploads",
#     StaticFiles(directory="uploads"),
#     name="uploads"
# )

# Create database tables
Base.metadata.create_all(bind=engine)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",

        "http://localhost:5174",
        "http://127.0.0.1:5174",

        "http://localhost:5175",
        "http://127.0.0.1:5175",

        "http://localhost:5176",
        "http://127.0.0.1:5176",

        "http://localhost:5177",
        "http://127.0.0.1:5177",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth_router)
app.include_router(researcher_router)
app.include_router(publication_router)

# New Group-based modules
app.include_router(research_group.router)
app.include_router(group_invitation.router)
app.include_router(chat.router)
app.include_router(meeting.router)

# Other modules
app.include_router(dashboard.router)
app.include_router(analytics.router)
app.include_router(search.router)

app.include_router(
    conference.router,
    prefix="/conference",
    tags=["Conference"]
)

app.include_router(
    institution.router,
    prefix="/institution",
    tags=["Institution"]
)
app.include_router(group_file.router)
# Home
@app.get("/")
def home():
    return {
        "message": "Scientific Collaboration Network Analyzer API is Running Successfully"
    }

from sqlalchemy import text

with engine.connect() as conn:
    print("Database:", conn.execute(text("SELECT current_database()")).scalar())
    print("Schema:", conn.execute(text("SELECT current_schema()")).scalar())

    tables = conn.execute(text("""
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
    """)).fetchall()

    print("Tables:", tables)