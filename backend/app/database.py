from sqlalchemy import create_engine, inspect, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from .config import settings

'''engine = create_engine(
    settings.DATABASE_URL,
    echo=True,
    pool_pre_ping=True
)'''
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    connect_args={"sslmode": "require"}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def build_sequence_sync_sql(table_name: str, pk_column: str, dialect_name: str | None = None) -> str | None:
    """Return a SQL statement that resyncs the primary key sequence for PostgreSQL."""
    dialect_name = (dialect_name or engine.dialect.name).lower()
    if dialect_name != "postgresql":
        return None
    return (
        f"SELECT setval(pg_get_serial_sequence('{table_name}', '{pk_column}'), "
        f"(SELECT COALESCE(MAX({pk_column}), 0) + 1 FROM {table_name}), false);"
    )


def ensure_database_sequences():
    """Resync PostgreSQL sequences after manual inserts or imports."""
    if engine.dialect.name != "postgresql":
        return

    for table_name, pk_column in (("users", "id"),):
        if table_name not in inspect(engine).get_table_names():
            continue
        sql = build_sequence_sync_sql(table_name, pk_column, engine.dialect.name)
        if not sql:
            continue
        with engine.begin() as connection:
            connection.execute(text(sql))


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

    citation_columns = {column["name"] for column in inspect(engine).get_columns("citations")} if "citations" in inspect(engine).get_table_names() else set()
    citation_additions = {
        "is_verified": "BOOLEAN DEFAULT FALSE",
        "is_flagged": "BOOLEAN DEFAULT FALSE",
    }
    if citation_columns:
        with engine.begin() as connection:
            for name, definition in citation_additions.items():
                if name not in citation_columns:
                    connection.execute(text(f"ALTER TABLE citations ADD COLUMN {name} {definition}"))
            verification_additions = {
                "status": "VARCHAR(24) DEFAULT 'pending'",
                "verified_by": "INTEGER",
                "verified_at": "TIMESTAMP",
                "verification_note": "TEXT",
                "rejected_by": "INTEGER",
                "rejected_at": "TIMESTAMP",
                "rejection_reason": "TEXT",
            }
            for name, definition in verification_additions.items():
                if name not in citation_columns:
                    connection.execute(text(f"ALTER TABLE citations ADD COLUMN {name} {definition}"))
            connection.execute(text("UPDATE citations SET status = CASE WHEN is_verified THEN 'verified' ELSE 'pending' END WHERE status IS NULL OR status = ''"))

    reference_columns = {column["name"] for column in inspect(engine).get_columns("references")} if "references" in inspect(engine).get_table_names() else set()
    reference_additions = {
        "is_verified": "BOOLEAN DEFAULT FALSE",
        "is_flagged": "BOOLEAN DEFAULT FALSE",
    }
    if reference_columns:
        with engine.begin() as connection:
            for name, definition in reference_additions.items():
                if name not in reference_columns:
                    connection.execute(text(f'ALTER TABLE "references" ADD COLUMN {name} {definition}'))

    conference_columns = {column["name"] for column in inspect(engine).get_columns("conferences")} if "conferences" in inspect(engine).get_table_names() else set()
    if conference_columns and "updated_at" not in conference_columns:
        # SQLite accepts DATETIME, whereas PostgreSQL requires TIMESTAMP.
        timestamp_type = "TIMESTAMP" if engine.dialect.name == "postgresql" else "DATETIME"
        with engine.begin() as connection:
            connection.execute(text(f"ALTER TABLE conferences ADD COLUMN updated_at {timestamp_type}"))

    # Review assignments existed before structured review drafts.  Keep older
    # development databases compatible without creating a parallel table.
    review_columns = {column["name"] for column in inspect(engine).get_columns("reviews")} if "reviews" in inspect(engine).get_table_names() else set()
    review_additions = {
        "due_date": "TIMESTAMP",
        "submitted_at": "TIMESTAMP",
        "criteria_scores": "TEXT",
    }
    if review_columns:
        with engine.begin() as connection:
            if engine.dialect.name == "postgresql":
                for value in ("DRAFT", "REVISION_REQUIRED"):
                    connection.execute(text(f"ALTER TYPE reviewstatus ADD VALUE IF NOT EXISTS '{value}'"))
            for name, definition in review_additions.items():
                if name not in review_columns:
                    connection.execute(text(f"ALTER TABLE reviews ADD COLUMN {name} {definition}"))
        # A previous development build briefly introduced lowercase enum
        # values. Normalize any rows it created after the new enum values have
        # been committed (PostgreSQL cannot use a freshly added enum value in
        # the same transaction).
        if engine.dialect.name == "postgresql":
            with engine.begin() as connection:
                connection.execute(text("""
                    UPDATE reviews
                    SET status = CASE status::text
                        WHEN 'draft' THEN 'DRAFT'::reviewstatus
                        WHEN 'revision_required' THEN 'REVISION_REQUIRED'::reviewstatus
                        ELSE status
                    END
                    WHERE status::text IN ('draft', 'revision_required')
                """))

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
