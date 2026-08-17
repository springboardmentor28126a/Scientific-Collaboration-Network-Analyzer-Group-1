from sqlalchemy import Column, Integer, String
from app.database import Base


class Team(Base):
    __tablename__ = "teams"

    id = Column(Integer, primary_key=True, index=True)
    team_name = Column(String, nullable=False)
    team_leader = Column(String, nullable=False)
    department = Column(String, nullable=False)
    description = Column(String)