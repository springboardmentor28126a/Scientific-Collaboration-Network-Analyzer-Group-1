from sqlalchemy import create_engine, text
from urllib.parse import quote_plus
from app.config import DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD

DATABASE_URL = f"postgresql://{DB_USER}:{quote_plus(DB_PASSWORD)}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
engine = create_engine(DATABASE_URL)

with engine.connect() as conn:
    try:
        conn.execute(text("ALTER TABLE researchers ADD COLUMN IF NOT EXISTS academic_position VARCHAR;"))
        conn.commit()
        print("Migrated researchers")
    except Exception as e:
        print("researchers error:", e)
        conn.rollback()
        
print("Done")
