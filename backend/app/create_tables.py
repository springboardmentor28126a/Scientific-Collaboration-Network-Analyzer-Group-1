from app.db.database import create_tables
from app.models.conference import Conference

# Import all models so SQLAlchemy registers them
from app.models.user import User
from app.models.institution import Institution
from app.models.department import Department
from app.models.researcher import Researcher


def main():
    print("Creating database tables...")
    create_tables()
    print("Database tables created successfully!")


if __name__ == "__main__":
    main()