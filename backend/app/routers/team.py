from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.team import Team
from app.schemas.team import TeamCreate, TeamUpdate

router = APIRouter(
    prefix="/teams",
    tags=["Teams"]
)


@router.post("/")
def create_team(
    team: TeamCreate,
    db: Session = Depends(get_db)
):

    new_team = Team(
        team_name=team.team_name,
        team_leader=team.team_leader,
        department=team.department,
        description=team.description
    )

    db.add(new_team)
    db.commit()
    db.refresh(new_team)

    return {
        "message": "Team created successfully",
        "team": new_team
    }


@router.get("/")
def get_teams(
    db: Session = Depends(get_db)
):

    return db.query(Team).all()


@router.get("/{team_id}")
def get_team(
    team_id: int,
    db: Session = Depends(get_db)
):

    team = db.query(Team).filter(Team.id == team_id).first()

    if not team:
        raise HTTPException(
            status_code=404,
            detail="Team not found"
        )

    return team


@router.put("/{team_id}")
def update_team(
    team_id: int,
    updated_team: TeamUpdate,
    db: Session = Depends(get_db)
):

    team = db.query(Team).filter(Team.id == team_id).first()

    if not team:
        raise HTTPException(
            status_code=404,
            detail="Team not found"
        )

    team.team_name = updated_team.team_name
    team.team_leader = updated_team.team_leader
    team.department = updated_team.department
    team.description = updated_team.description

    db.commit()
    db.refresh(team)

    return {
        "message": "Team updated successfully"
    }


@router.delete("/{team_id}")
def delete_team(
    team_id: int,
    db: Session = Depends(get_db)
):

    team = db.query(Team).filter(Team.id == team_id).first()

    if not team:
        raise HTTPException(
            status_code=404,
            detail="Team not found"
        )

    db.delete(team)
    db.commit()

    return {
        "message": "Team deleted successfully"
    }