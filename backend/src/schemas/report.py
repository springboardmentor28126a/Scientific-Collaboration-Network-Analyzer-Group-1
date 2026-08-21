from pydantic import BaseModel
from typing import Optional, Dict, List
from datetime import datetime


# =========================================================
# SAVED REPORT
# =========================================================

class SavedReportCreate(BaseModel):

    title: str

    type: str

    query_params: Optional[str] = None


class SavedReportOut(SavedReportCreate):

    id: int

    created_by: int

    created_at: datetime

    model_config = {
        "from_attributes": True
    }


# =========================================================
# PUBLICATION REPORT
# =========================================================

class PublicationReportOut(BaseModel):

    total_publications: int

    type_counts: Dict[str, int]

    status_counts: Dict[str, int]


# =========================================================
# RESEARCHER REPORT
# =========================================================

class ResearchReportOut(BaseModel):

    total_researchers: int

    department_counts: Dict[str, int]

    skills_summary: List[str]


# =========================================================
# COLLABORATION REPORT
# =========================================================

class CollaborationReportOut(BaseModel):

    total_collaborations: int

    type_counts: Dict[str, int]


# =========================================================
# INSTITUTION REPORT
# =========================================================

class InstitutionReportOut(BaseModel):

    total_institutions: int

    total_departments: int

    researcher_counts_by_institution: Dict[str, int]