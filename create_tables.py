import sys
import os

sys.path.append(os.path.join(os.path.dirname(__file__), "backend"))

from backend.app.database import engine
from backend.app.models.conference_model import Conference

Conference.__table__.create(engine, checkfirst=True)
print("Conference table created")
