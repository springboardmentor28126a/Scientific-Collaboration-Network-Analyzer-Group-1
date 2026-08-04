import os

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.exc import OperationalError
from sqlalchemy.orm import declarative_base, sessionmaker

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL") or os.getenv("Database_URL")
DEFAULT_SQLITE_URL = "sqlite:///./app.db"


def _create_engine(database_url: str):
    connect_args = {"check_same_thread": False} if database_url.startswith("sqlite") else {}
    echo_sql = os.getenv("SQLALCHEMY_ECHO", "false").lower() == "true"
    return create_engine(database_url, echo=echo_sql, connect_args=connect_args)


engine = _create_engine(DATABASE_URL or DEFAULT_SQLITE_URL)

if DATABASE_URL and not DATABASE_URL.startswith("sqlite"):
    try:
        with engine.connect():
            pass
    except OperationalError as exc:
        raise RuntimeError(
            "PostgreSQL database connection failed. Check DATABASE_URL in Backend/.env. "
            "For Supabase, use the pooler connection string and add ?sslmode=require."
        ) from exc

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
