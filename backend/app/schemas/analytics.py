from typing import List
from pydantic import BaseModel


class TopResearcher(BaseModel):
    researcher_id: int
    first_name: str
    last_name: str
    publication_count: int


class TopInstitution(BaseModel):
    institution_id: int
    institution_name: str
    researcher_count: int
    publication_count: int


class RecentPublication(BaseModel):
    id: int
    title: str
    publication_type: str
    status: str
    owner_first_name: str
    owner_last_name: str


class AnalyticsSummary(BaseModel):
    total_researchers: int
    total_publications: int
    total_conferences: int
    total_collaborations: int
    total_citations: int
    total_institutions: int
    recent_publications: List[RecentPublication]
    top_researchers: List[TopResearcher]
    top_institutions: List[TopInstitution]