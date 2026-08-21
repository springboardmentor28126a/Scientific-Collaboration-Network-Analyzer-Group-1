from sqlalchemy import Column, String, Text, Date, Integer, Boolean
import uuid
from ..database.base import Base

class Conference(Base):
    __tablename__ = "conferences_v2"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    acronym = Column(String, nullable=True)
    description = Column(Text, nullable=True)
    conference_type = Column(String, nullable=True)
    organizer = Column(String, nullable=True)
    institution_id = Column(String, nullable=True)
    venue = Column(String, nullable=True)
    city = Column(String, nullable=True)
    state = Column(String, nullable=True)
    country = Column(String, nullable=True)
    website = Column(String, nullable=True)
    contact_email = Column(String, nullable=True)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=True)
    registration_deadline = Column(Date, nullable=True)
    submission_deadline = Column(Date, nullable=True)
    maximum_participants = Column(Integer, nullable=True)
    registration_fee = Column(Integer, default=0)
    mode = Column(String, nullable=True)  # e.g., "online", "offline", "hybrid"
    status = Column(String, default="draft")
    banner_file_id = Column(String, nullable=True)  # FK to files table (optional)
    created_by = Column(String, nullable=False)  # user id of creator
    created_at = Column(Date, nullable=False)
    updated_at = Column(Date, nullable=False)
    is_archived = Column(Boolean, default=False)
