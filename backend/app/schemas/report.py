from typing import Optional
from pydantic import BaseModel


class ResearcherReportItem(BaseModel):
    researcher_id: int
    first_name: str
    last_name: str
    institution_name: str
    department_name: str
    publication_count: int
    citation_count: int


class PublicationReportItem(BaseModel):
    publication_id: int
    title: str
    publication_type: str
    status: str
    owner_first_name: str
    owner_last_name: str
    institution_name: str
    conference_title: Optional[str] = None
    citation_count: int


class ConferenceReportItem(BaseModel):
    conference_id: int
    title: str
    start_date: str
    end_date: str
    total_participants: int
    presenter_count: int
    attendee_count: int