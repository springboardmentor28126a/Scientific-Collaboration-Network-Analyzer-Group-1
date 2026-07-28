from app.db.database import Base, engine
from app.models.user import User
from app.models.institution import Institution
from app.models.department import Department
from app.models.researcher import Researcher
from app.models.conference import Conference

Base.metadata.create_all(bind=engine)
print("Base tables created: users, institutions, departments, researchers, conferences")