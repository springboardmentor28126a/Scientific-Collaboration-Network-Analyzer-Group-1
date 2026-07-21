from sqlalchemy import create_engine, inspect, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from .config import settings

engine = create_engine(
    settings.DATABASE_URL,
    echo=True,
    pool_pre_ping=True
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def ensure_user_access_columns():
    """Add the access-request fields for existing development databases.

    A proper deployment should use Alembic migrations; this keeps the local
    SQLite database created in earlier milestones compatible during development.
    """
    if "users" not in inspect(engine).get_table_names():
        return
    existing = {column["name"] for column in inspect(engine).get_columns("users")}
    additions = {
        "requested_role": "VARCHAR",
        "role_request_status": "VARCHAR DEFAULT 'approved'",
        "assigned_institution_id": "INTEGER",
    }
    with engine.begin() as connection:
        for name, definition in additions.items():
            if name not in existing:
                connection.execute(text(f"ALTER TABLE users ADD COLUMN {name} {definition}"))

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
