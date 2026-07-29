from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.orm import joinedload
from models import ResearchGroup, ResearchGroupMember, User
from schemas.research_group import ResearchGroupDetailsResponse
from backend.database.database import get_db
from backend.models.research_group import ResearchGroup
from backend.models.research_group_member import ResearchGroupMember
from backend.database.models import User
from backend.schemas.research_group import (
    ResearchGroupCreate,
    ResearchGroupResponse,
    GroupMemberResponse,
    MyGroupResponse
)

router = APIRouter(
    prefix="/groups",
    tags=["Research Groups"]
)
@router.post(
    "/create",
    response_model=ResearchGroupResponse
)
def create_group(
    group: ResearchGroupCreate,
    db: Session = Depends(get_db)
):

    user = (
        db.query(User)
        .filter(User.id == group.created_by)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    new_group = ResearchGroup(
        name=group.name,
        description=group.description,
        visibility=group.visibility,
        created_by=group.created_by
    )

    db.add(new_group)
    db.commit()
    db.refresh(new_group)

    owner = ResearchGroupMember(
        group_id=new_group.id,
        user_id=group.created_by,
        role="Owner"
    )

    db.add(owner)
    db.commit()

    return new_group

@router.get(
    "/{group_id}/members",
    response_model=list[GroupMemberResponse]
)
def get_group_members(
    group_id: int,
    db: Session = Depends(get_db)
):
    members = (
        db.query(ResearchGroupMember)
        .filter(
            ResearchGroupMember.group_id == group_id
        )
        .all()
    )

    result = []

    for member in members:
        user = (
            db.query(User)
            .filter(User.id == member.user_id)
            .first()
        )

        if user:
            result.append({
                "user_id": user.id,
                "name": user.name,
                "email": user.email,
                "role": member.role,
                "institution": user.institution_name
            })

    return result

@router.get(
    "/my/{user_id}",
    response_model=list[MyGroupResponse]
)
def get_my_groups(
    user_id: int,
    db: Session = Depends(get_db)
):
    memberships = (
        db.query(ResearchGroupMember)
        .filter(
            ResearchGroupMember.user_id == user_id
        )
        .all()
    )

    result = []

    for membership in memberships:

        group = (
            db.query(ResearchGroup)
            .filter(
                ResearchGroup.id == membership.group_id
            )
            .first()
        )

        if not group:
            continue

        member_count = (
            db.query(ResearchGroupMember)
            .filter(
                ResearchGroupMember.group_id == group.id
            )
            .count()
        )

        result.append({
            "id": group.id,
            "name": group.name,
            "description": group.description,
            "visibility": group.visibility,
            "role": membership.role,
            "member_count": member_count,
            "created_at": group.created_at
        })

    return result

@router.get(
    "/{group_id}",
    response_model=ResearchGroupDetailsResponse
)
def get_group_details(
    group_id: int,
    db: Session = Depends(get_db)
):

    group = (
        db.query(ResearchGroup)
        .options(joinedload(ResearchGroup.creator))
        .filter(ResearchGroup.id == group_id)
        .first()
    )

    if group is None:
        raise HTTPException(
            status_code=404,
            detail="Research group not found"
        )

    member_count = (
        db.query(ResearchGroupMember)
        .filter(
            ResearchGroupMember.group_id == group_id
        )
        .count()
    )

    return {
        "id": group.id,
        "name": group.name,
        "description": group.description,
        "created_by": group.created_by,
        "created_by_name": group.creator.name,
        "member_count": member_count,
        "created_at": group.created_at
    }
@router.delete("/{group_id}/members/{user_id}")
def remove_group_member(
    group_id: int,
    user_id: int,
    requester_id: int,
    db: Session = Depends(get_db)
):
    requester = (
        db.query(ResearchGroupMember)
        .filter(
            ResearchGroupMember.group_id == group_id,
            ResearchGroupMember.user_id == requester_id
        )
        .first()
    )

    if not requester or requester.role not in ["Owner", "Admin"]:
        raise HTTPException(
            status_code=403,
            detail="Only Owner/Admin can remove members"
        )

    member = (
        db.query(ResearchGroupMember)
        .filter(
            ResearchGroupMember.group_id == group_id,
            ResearchGroupMember.user_id == user_id
        )
        .first()
    )

    if not member:
        raise HTTPException(
            status_code=404,
            detail="Member not found"
        )

    if member.role == "Owner":
        raise HTTPException(
            status_code=400,
            detail="Owner cannot be removed"
        )

    db.delete(member)
    db.commit()

    return {
        "message": "Member removed successfully"
    }

@router.delete("/{group_id}/leave/{user_id}")
def leave_group(
    group_id: int,
    user_id: int,
    db: Session = Depends(get_db)
):
    member = (
        db.query(ResearchGroupMember)
        .filter(
            ResearchGroupMember.group_id == group_id,
            ResearchGroupMember.user_id == user_id
        )
        .first()
    )

    if not member:
        raise HTTPException(
            status_code=404,
            detail="Not a member"
        )

    if member.role == "Owner":
        raise HTTPException(
            status_code=400,
            detail="Owner cannot leave the group"
        )

    db.delete(member)
    db.commit()

    return {
        "message": "Left group successfully"
    }