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
    conference_columns = {column["name"] for column in inspect(engine).get_columns("conferences")} if "conferences" in inspect(engine).get_table_names() else set()
    if conference_columns and "updated_at" not in conference_columns:
        # SQLite accepts DATETIME, whereas PostgreSQL requires TIMESTAMP.
        timestamp_type = "TIMESTAMP" if engine.dialect.name == "postgresql" else "DATETIME"
        with engine.begin() as connection:
            connection.execute(text(f"ALTER TABLE conferences ADD COLUMN updated_at {timestamp_type}"))

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
