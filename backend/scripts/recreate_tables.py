import sys
import os

# Add the backend directory to the path so we can import app
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from sqlalchemy import text
from app.database import engine, Base
from app.models import User, ResearchProject, Institution, CollaborationRequest, ProjectMember, Citation, Reference

def recreate_tables():
    with engine.begin() as conn:
        print("Dropping tables...")
        # Drop old collaborations table if it exists
        conn.execute(text("DROP TABLE IF EXISTS collaborations CASCADE"))
        
        # Drop tables that we modified significantly
        conn.execute(text("DROP TABLE IF EXISTS collaboration_requests CASCADE"))
        conn.execute(text("DROP TABLE IF EXISTS project_members CASCADE"))
        conn.execute(text("DROP TABLE IF EXISTS citations CASCADE"))
        conn.execute(text('DROP TABLE IF EXISTS "references" CASCADE'))
        
        # Also drop enum types in postgres to avoid 'type already exists' errors when recreating
        conn.execute(text("DROP TYPE IF EXISTS projectmemberstatus CASCADE"))
        conn.execute(text("DROP TYPE IF EXISTS collaborationrequeststatus CASCADE"))
        conn.execute(text("DROP TYPE IF EXISTS referencetype CASCADE"))
        print("Tables dropped.")
        
    print("Recreating tables...")
    Base.metadata.create_all(bind=engine)
    print("Tables recreated successfully.")

if __name__ == "__main__":
    recreate_tables()
