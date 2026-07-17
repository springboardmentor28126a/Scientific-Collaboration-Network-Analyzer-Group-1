from pydantic import BaseModel

class AnalyticsOverview(BaseModel):
    total_researchers: int
    total_publications: int
    total_institutions: int
    total_conferences: int
    publications_by_year: dict[str, int] = {}
    publication_types: dict[str, int] = {}
    top_institutions: list[dict] = []
    top_researchers: list[dict] = []
    conference_participation: list[dict] = []
    research_growth: list[dict] = []

    class Config:
        from_attributes = True
