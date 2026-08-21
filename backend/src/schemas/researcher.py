from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


# =========================================================
# BASE SCHEMA
# =========================================================

class ResearcherBase(BaseModel):
    full_name: str = Field(
        ...,
        min_length=1,
        max_length=255,
    )

    institution_id: Optional[int] = None

    # Department is intentionally stored as plain text.
    # No department_id and no Department table are required.
    department: Optional[str] = Field(
        default=None,
        max_length=150,
    )

    bio: Optional[str] = None

    research_interests: Optional[str] = None

    skills: Optional[str] = None


# =========================================================
# CREATE
# =========================================================

class ResearcherCreate(ResearcherBase):
    pass


# =========================================================
# UPDATE
# =========================================================

class ResearcherUpdate(BaseModel):
    full_name: Optional[str] = Field(
        default=None,
        min_length=1,
        max_length=255,
    )

    institution_id: Optional[int] = None

    department: Optional[str] = Field(
        default=None,
        max_length=150,
    )

    bio: Optional[str] = None

    research_interests: Optional[str] = None

    skills: Optional[str] = None


# =========================================================
# OUTPUT
# =========================================================

class ResearcherOut(ResearcherBase):
    id: int

    user_id: int

    created_at: Optional[datetime] = None

    updated_at: Optional[datetime] = None

    model_config = ConfigDict(
        from_attributes=True
    )