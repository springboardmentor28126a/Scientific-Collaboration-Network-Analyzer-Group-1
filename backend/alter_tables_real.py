import sys
import os
from sqlalchemy import text, inspect

# Add src to python path
sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__file__)), "src"))

from database import engine

print("Connecting to database via SQLAlchemy engine...")
ins = inspect(engine)

# Get columns for projects
project_cols = [c['name'] for c in ins.get_columns('projects')]
print(f"Current columns in projects table: {project_cols}")

# Get columns for publications
publication_cols = [c['name'] for c in ins.get_columns('publications')]
print(f"Current columns in publications table: {publication_cols}")

# Alter projects table
with engine.begin() as conn:
    if 'created_by' not in project_cols:
        print("Adding created_by column to projects table...")
        conn.execute(text("ALTER TABLE projects ADD COLUMN created_by INTEGER REFERENCES users(id)"))
        print("Successfully added created_by column.")
    else:
        print("created_by column already exists in projects.")

    if 'visible_to_others' not in project_cols:
        print("Adding visible_to_others column to projects table...")
        # Boolean type in postgres is BOOLEAN, in sqlite is BOOLEAN
        conn.execute(text("ALTER TABLE projects ADD COLUMN visible_to_others BOOLEAN DEFAULT FALSE"))
        print("Successfully added visible_to_others column.")
    else:
        print("visible_to_others column already exists in projects.")

    if 'visible_to_others' not in publication_cols:
        print("Adding visible_to_others column to publications table...")
        conn.execute(text("ALTER TABLE publications ADD COLUMN visible_to_others BOOLEAN DEFAULT FALSE"))
        print("Successfully added visible_to_others column.")
    else:
        print("visible_to_others column already exists in publications.")

print("Database schema updated successfully via SQLAlchemy!")
