import asyncio
import logging
import os
import re

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import inspect, text
from sqlalchemy.exc import SQLAlchemyError

from backend.database.database import Base, engine, SessionLocal
from backend.database.models import User
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
from backend.routers import ai
from backend.routers.dashboard import run_due_reminders

logger = logging.getLogger(__name__)


app = FastAPI(
    title="Scientific Collaboration Network Analyzer",
    description="Research Collaboration Management Platform",
    version="1.0.0"
)

reminder_task = None


async def reminder_scheduler():
    while True:
        db = SessionLocal()
        try:
            run_due_reminders(db)
        except Exception as exc:
            logger.exception("Reminder scheduler error")
        finally:
            db.close()
        await asyncio.sleep(60)


@app.on_event("startup")
async def start_reminder_scheduler():
    global reminder_task
    reminder_task = asyncio.create_task(reminder_scheduler())


@app.on_event("shutdown")
async def stop_reminder_scheduler():
    if reminder_task:
        reminder_task.cancel()


os.makedirs("uploads/papers", exist_ok=True)

app.mount(
    "/uploads",
    StaticFiles(directory="uploads"),
    name="uploads"
)




# Create database tables
Base.metadata.create_all(bind=engine)


def apply_sqlite_schema_migration() -> None:
    """Backfill columns added after the bundled SQLite database was created."""
    if engine.dialect.name != "sqlite":
        return

    required_columns = {
        "users": {
            "verification_status": "VARCHAR NOT NULL DEFAULT 'Pending'",
            "is_verified": "BOOLEAN NOT NULL DEFAULT 0",
            "verified_by": "INTEGER",
            "verified_at": "DATETIME",
            "account_status": "VARCHAR NOT NULL DEFAULT 'Active'",
            "warning_count": "INTEGER NOT NULL DEFAULT 0",
            "moderation_reason": "TEXT",
            "mfa_enabled": "BOOLEAN NOT NULL DEFAULT 0",
            "mfa_secret": "VARCHAR",
            "mfa_recovery_codes": "TEXT",
        },
    }
    with engine.begin() as connection:
        inspector = inspect(connection)
        for table_name, columns in required_columns.items():
            existing_columns = {column["name"] for column in inspector.get_columns(table_name)}
            for column_name, definition in columns.items():
                if column_name not in existing_columns:
                    connection.execute(text(
                        f'ALTER TABLE "{table_name}" ADD COLUMN "{column_name}" {definition}'
                    ))


apply_sqlite_schema_migration()

# Existing deployments do not receive new indexes from create_all(). Keep the
# one-System-Admin invariant enforced by the database as well as the API.
with engine.begin() as connection:
    connection.execute(text(
        "CREATE UNIQUE INDEX IF NOT EXISTS uq_users_single_system_admin "
        "ON users (role) WHERE role = 'System Admin'"
    ))

# CORS
default_cors_origins = [
    f"http://{host}:{port}"
    for host in ("localhost", "127.0.0.1")
    for port in (5173, 5174, 5175, 5176, 5177, 8080)
]
cors_origins = [
    origin.strip()
    for origin in os.getenv("SCNA_CORS_ORIGINS", ",".join(default_cors_origins)).split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
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
app.include_router(ai.router)
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
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_status VARCHAR DEFAULT 'Pending' NOT NULL",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE NOT NULL",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS verified_by INTEGER REFERENCES users(id)",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP WITH TIME ZONE",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS account_status VARCHAR DEFAULT 'Active' NOT NULL",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS warning_count INTEGER DEFAULT 0 NOT NULL",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS moderation_reason TEXT",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS mfa_enabled BOOLEAN DEFAULT FALSE NOT NULL",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS mfa_secret VARCHAR",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS mfa_recovery_codes TEXT",
        "CREATE TABLE IF NOT EXISTS email_otp_codes (id SERIAL PRIMARY KEY, email VARCHAR NOT NULL, purpose VARCHAR NOT NULL DEFAULT 'login', code_hash VARCHAR NOT NULL, expires_at TIMESTAMP WITH TIME ZONE NOT NULL, attempts INTEGER NOT NULL DEFAULT 0, consumed_at TIMESTAMP WITH TIME ZONE, created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP)",
        "CREATE INDEX IF NOT EXISTS ix_email_otp_codes_email ON email_otp_codes(email)",
        "CREATE TABLE IF NOT EXISTS auth_rate_limits (id SERIAL PRIMARY KEY, key VARCHAR UNIQUE NOT NULL, window_started_at TIMESTAMP WITH TIME ZONE NOT NULL, attempts INTEGER NOT NULL DEFAULT 0)",
        "CREATE TABLE IF NOT EXISTS conference_registrations (id SERIAL PRIMARY KEY, conference_id INTEGER NOT NULL REFERENCES conferences(id) ON DELETE CASCADE, user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE, registered_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP, CONSTRAINT uq_conference_registration UNIQUE (conference_id, user_id))",
        "CREATE TABLE IF NOT EXISTS moderation_events (id SERIAL PRIMARY KEY, target_user_id INTEGER NOT NULL, moderator_id INTEGER REFERENCES users(id) ON DELETE SET NULL, action VARCHAR NOT NULL, reason TEXT, created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP)",
    )

    alter_column_pattern = re.compile(
        r"ALTER TABLE (?:\"?)([A-Za-z_][A-Za-z0-9_]*)(?:\"?) ADD COLUMN(?: IF NOT EXISTS)? (?:\"?)([A-Za-z_][A-Za-z0-9_]*)(?:\"?)",
        re.IGNORECASE,
    )

    with engine.begin() as connection:
        inspector = inspect(connection)
        existing_columns = {}
        for table_name in ("publications", "conferences", "users"):
            if inspector.has_table(table_name):
                existing_columns[table_name] = {
                    column["name"] for column in inspector.get_columns(table_name)
                }

        for statement in statements:
            match = alter_column_pattern.match(statement)
            if match:
                table_name, column_name = match.groups()
                if column_name in existing_columns.get(table_name, set()):
                    logger.info(
                        "Skipping already-applied migration column %s.%s",
                        table_name,
                        column_name,
                    )
                    continue

            try:
                # Avoid waiting for an unrelated long-running transaction during
                # import/startup. A failed optional migration is logged and does
                # not make the API unavailable; the next deployment can retry it.
                with connection.begin_nested():
                    connection.execute(text("SET LOCAL lock_timeout = '2s'"))
                    connection.execute(text(statement))
            except SQLAlchemyError as exc:
                logger.warning(
                    "Optional PostgreSQL migration failed; startup will continue. "
                    "Statement=%s Error=%s",
                    statement,
                    str(exc).splitlines()[0],
                )


apply_publication_review_migration()
