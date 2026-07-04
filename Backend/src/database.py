from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker,declarative_base
from dotenv import load_dotenv
import os

load_dotenv() 
#This loads the environment variables like database_url,secret_key from the .env file
#Without this we cannot get the databse url and the secret code

DATABASE_URL=os.getenv("Database_URL")
#We get the database_url from the .env file

engine= create_engine(DATABASE_URL,echo=True)
#Creates the connection pool to the Postgres

SessionLocal = sessionmaker(autocommit=False,autoflush=False, bind=engine)
## ↑ This is a FACTORY, not a session itself.
# Calling SessionLocal() later creates a new database session bound to our engine.
# autocommit=False → you must explicitly call db.commit() — nothing saves automatically
# autoflush=False  → SQLAlchemy won't auto-send pending changes before every query

Base = declarative_base()
# When a class inherits Base, SQLAlchemy registers its table structure into Base.metadata

def get_db():
    db=SessionLocal() #opens a new session
    try:
        yield db  # handles this session to whoever called get_db()
    finally:
        db.close()  #ALWAYS close the session, even if the route crashed

