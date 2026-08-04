import sys
import os
import sqlite3

# Add src to python path
sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__file__)), "src"))

from database import Base, engine
import models

# Ensure all tables are created first
print("Ensuring all tables are created...")
Base.metadata.create_all(bind=engine)

# Connect to the SQLite DB to alter tables
db_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "app.db")
print(f"Connecting to SQLite database at {db_path} to add missing columns...")
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Get all tables
cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
tables = [row[0] for row in cursor.fetchall()]
print(f"Tables in SQLite: {tables}")

# Alter projects table
if "projects" in tables:
    try:
        print("Adding created_by to projects table...")
        cursor.execute("ALTER TABLE projects ADD COLUMN created_by INTEGER REFERENCES users(id)")
        print("Successfully added created_by column.")
    except sqlite3.OperationalError as e:
        print(f"Skipping created_by column addition: {e}")

    try:
        print("Adding visible_to_others to projects table...")
        cursor.execute("ALTER TABLE projects ADD COLUMN visible_to_others BOOLEAN DEFAULT 0")
        print("Successfully added visible_to_others column.")
    except sqlite3.OperationalError as e:
        print(f"Skipping visible_to_others column addition: {e}")
else:
    print("WARNING: projects table NOT found in SQLite master!")

# Alter publications table
if "publications" in tables:
    try:
        print("Adding visible_to_others to publications table...")
        cursor.execute("ALTER TABLE publications ADD COLUMN visible_to_others BOOLEAN DEFAULT 0")
        print("Successfully added visible_to_others column.")
    except sqlite3.OperationalError as e:
        print(f"Skipping visible_to_others column addition: {e}")
else:
    print("WARNING: publications table NOT found in SQLite master!")

conn.commit()
conn.close()
print("Database schema updated successfully!")
