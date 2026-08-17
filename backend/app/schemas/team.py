from pydantic import BaseModel


class TeamCreate(BaseModel):
    team_name: str
    team_leader: str
    department: str
    description: str


class TeamUpdate(BaseModel):
    team_name: str
    team_leader: str
    department: str
    description: str


class TeamResponse(BaseModel):
    id: int
    team_name: str
    team_leader: str
    department: str
    description: str

    class Config:
        from_attributes = True