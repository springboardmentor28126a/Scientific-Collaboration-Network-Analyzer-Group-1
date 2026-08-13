from app.db.database import create_tables

# Import all models so SQLAlchemy registers them
from app.models.user import User
from app.models.institution import Institution
from app.models.department import Department
from app.models.researcher import Researcher

from app.models.publication import Publication
from app.models.citation import Citation
from app.models.collaboration import Collaboration

from app.models.conference import Conference
from app.models.conference_registration import ConferenceRegistration

from app.models.notification import Notification

def main():
    print("Creating database tables...")
    create_tables()
    print("Database tables created successfully!")


if __name__ == "__main__":
    main()