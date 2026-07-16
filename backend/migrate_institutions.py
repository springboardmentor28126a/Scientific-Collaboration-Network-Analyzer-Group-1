from sqlalchemy import create_engine, text
from urllib.parse import quote_plus
from app.config import DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD

DATABASE_URL = f"postgresql://{DB_USER}:{quote_plus(DB_PASSWORD)}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
engine = create_engine(DATABASE_URL)

with engine.connect() as conn:
    try:
        conn.execute(text("ALTER TABLE institutions RENAME COLUMN name TO institution_name;"))
        conn.execute(text("ALTER TABLE institutions RENAME COLUMN contact_email TO email;"))
        conn.execute(text("ALTER TABLE institutions RENAME COLUMN contact_phone TO phone;"))
        conn.execute(text("ALTER TABLE institutions RENAME COLUMN user_id TO created_by;"))
        conn.commit()
        print("Migrated institutions")
    except Exception as e:
        print("Institutions error:", e)
        conn.rollback()
        
print("Done")
