from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

DATABASE_URL = (
    "postgresql+psycopg2://"
    "postgres.ejjalcfggrwadhhzatem:Tejeswararao@"
    "aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres"
    "?sslmode=require"
)

engine = create_engine(
    DATABASE_URL,
    connect_args={"sslmode": "require"}
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()