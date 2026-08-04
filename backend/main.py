from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from fastapi.staticfiles import StaticFiles
import os



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

from backend.routers import citation

from backend.routers import meeting
from backend.routers import research_group
from backend.routers import group_invitation
from backend.routers import group_file
from backend.routers.friend import router as friend_router
from backend.routers.private_chat import router as private_chat_router
from backend.routers import verification
# Import models so SQLAlchemy creates tables
from backend.models.meeting import Meeting
from backend.models.research_group import ResearchGroup
from backend.models.research_group_member import ResearchGroupMember
from backend.models.group_invitation import GroupInvitation
from backend.models.group_file import GroupFile
from backend.models.direct_conversation import DirectConversation
from backend.models.direct_message import DirectMessage
from backend.models.friend_request import FriendRequest
from backend.models.verification_document import VerificationDocument
from backend.routers import reviewer
from backend.routers import faculty
from backend.routers import admin



app = FastAPI(
    title="Scientific Collaboration Network Analyzer",
    description="Research Collaboration Management Platform",
    version="1.0.0"
)


os.makedirs("uploads/papers", exist_ok=True)

app.mount(
    "/uploads",
    StaticFiles(directory="uploads"),
    name="uploads"
)




# Create database tables
Base.metadata.create_all(bind=engine)

# Existing deployments do not receive new indexes from create_all(). Keep the
# one-System-Admin invariant enforced by the database as well as the API.
with engine.begin() as connection:
    connection.execute(text(
        "CREATE UNIQUE INDEX IF NOT EXISTS uq_users_single_system_admin "
        "ON users (role) WHERE role = 'System Admin'"
    ))

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
app.include_router(friend_router)
app.include_router(private_chat_router)

# Other modules
app.include_router(dashboard.router)
app.include_router(analytics.router)
app.include_router(search.router)

app.include_router(
    conference.router,
    prefix="/conference",
    tags=["Conference"]
)

app.include_router(institution.router,prefix="/institution",tags=["Institution"])

app.include_router(citation.router)



app.include_router(group_file.router)
app.include_router(verification.router)
app.include_router(reviewer.router)
app.include_router(faculty.router)
app.include_router(admin.router)
# Home

@app.get("/")
def home():
    return {
        "message": "Scientific Collaboration Network Analyzer API is Running Successfully"
    }

from sqlalchemy import text


def apply_publication_review_migration():
    """Add review-workflow columns for existing PostgreSQL deployments.

    ``create_all`` creates these columns for new databases but does not alter
    the already deployed ``publications`` table.
    """
    if engine.dialect.name != "postgresql":
        return

    statements = (
        "ALTER TABLE publications ADD COLUMN IF NOT EXISTS selected_reviewer_id INTEGER REFERENCES users(id)",
        "ALTER TABLE publications ADD COLUMN IF NOT EXISTS reviewed_by INTEGER REFERENCES users(id)",
        "ALTER TABLE publications ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP WITH TIME ZONE",
        "ALTER TABLE publications ADD COLUMN IF NOT EXISTS review_comments TEXT",
        "ALTER TABLE conferences ADD COLUMN IF NOT EXISTS created_by INTEGER REFERENCES users(id)",
    )

    with engine.begin() as connection:
        for statement in statements:
            connection.execute(text(statement))


apply_publication_review_migration()

with engine.connect() as conn:
    print("Database:", conn.execute(text("SELECT current_database()")).scalar())
    print("Schema:", conn.execute(text("SELECT current_schema()")).scalar())

    tables = conn.execute(text("""
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
    """)).fetchall()

    print("Tables:", tables)
