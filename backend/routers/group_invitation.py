from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.database.database import get_db
from backend.database.models import ActivityEvent, Notification, User
from backend.models.research_group import ResearchGroup
from backend.models.research_group_member import ResearchGroupMember
from backend.models.group_invitation import GroupInvitation

from backend.schemas.group_invitation import (
    GroupInvitationCreate,
    GroupInvitationResponse,
    GroupInvitationListResponse
)
from sqlalchemy.orm import Session
from fastapi import Depends, HTTPException
from backend.utils.dependencies import require_permission
from backend.utils.security import get_current_user


router = APIRouter(
    prefix="/group-invitations",
    tags=["Group Invitations"]
)
@router.post(
    "/send",
    response_model=GroupInvitationResponse
)
def send_invitation(
    invitation: GroupInvitationCreate,
    current_user: User = Depends(require_permission("group:invite")),
    db: Session = Depends(get_db)
):
    group = db.query(ResearchGroup).filter(
        ResearchGroup.id == invitation.group_id
    ).first()

    if not group:
        raise HTTPException(
            status_code=404,
            detail="Group not found"
        )

    member = db.query(ResearchGroupMember).filter(
        ResearchGroupMember.group_id == invitation.group_id,
        ResearchGroupMember.user_id == current_user.id
    ).first()

    if not member or member.role not in ["Owner", "Admin"]:
        raise HTTPException(
            status_code=403,
            detail="Only Owner/Admin can invite members"
        )

    existing_member = db.query(ResearchGroupMember).filter(
        ResearchGroupMember.group_id == invitation.group_id,
        ResearchGroupMember.user_id == invitation.receiver_id
    ).first()

    if existing_member:
        raise HTTPException(
            status_code=400,
            detail="User is already a member"
        )

    existing_invite = db.query(GroupInvitation).filter(
        GroupInvitation.group_id == invitation.group_id,
        GroupInvitation.receiver_id == invitation.receiver_id,
        GroupInvitation.status == "Pending"
    ).first()

    if existing_invite:
        raise HTTPException(
            status_code=400,
            detail="Invitation already sent"
        )

    new_invitation = GroupInvitation(
        group_id=invitation.group_id,
        sender_id=current_user.id,
        receiver_id=invitation.receiver_id
    )

    db.add(new_invitation)
    db.commit()
    db.refresh(new_invitation)

    db.add(Notification(
        user_id=invitation.receiver_id,
        title="Research group invitation",
        message=f"{current_user.name} invited you to join {group.name}.",
        notification_type="group_invitation",
        resource_type="research_group",
        resource_id=group.id,
    ))
    db.add(ActivityEvent(
        user_id=current_user.id,
        event_type="group_invitation_sent",
        description=f"Invitation sent to join {group.name}",
        resource_type="research_group",
        resource_id=group.id,
    ))
    db.commit()

    return new_invitation

@router.get(
    "/user/{user_id}",
    response_model=list[GroupInvitationListResponse]
)
def get_my_invitations(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "System Admin" and user_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only view your own invitations.")

    invitations = (
        db.query(GroupInvitation)
        .filter(
            GroupInvitation.receiver_id == user_id,
            GroupInvitation.status == "Pending"
        )
        .all()
    )

    result = []

    for invite in invitations:

        group = db.query(ResearchGroup).filter(
            ResearchGroup.id == invite.group_id
        ).first()

        sender = db.query(User).filter(
            User.id == invite.sender_id
        ).first()

        result.append({
            "id": invite.id,
            "group_id": invite.group_id,
            "group_name": group.name if group else "",

            "sender_id": invite.sender_id,
            "sender_name": sender.name if sender else "",

            "receiver_id": invite.receiver_id,

            "status": invite.status,

            "created_at": invite.created_at
        })

    return result

@router.get("/available-groups/{receiver_id}")
def get_available_groups(
    receiver_id: int,
    sender_id: int,
    db: Session = Depends(get_db)
):
    groups = (
        db.query(ResearchGroup)
        .filter(ResearchGroup.created_by == sender_id)
        .all()
    )

    response = []

    for group in groups:

        member = (
            db.query(ResearchGroupMember)
            .filter(
                ResearchGroupMember.group_id == group.id,
                ResearchGroupMember.user_id == receiver_id
            )
            .first()
        )

        if member:
            response.append({
                "group_id": group.id,
                "group_name": group.name,
                "status": "member"
            })
            continue

        invitation = (
            db.query(GroupInvitation)
            .filter(
                GroupInvitation.group_id == group.id,
                GroupInvitation.sender_id == sender_id,
                GroupInvitation.receiver_id == receiver_id,
                GroupInvitation.status == "Pending"
            )
            .first()
        )

        if invitation:
            response.append({
                "group_id": group.id,
                "group_name": group.name,
                "status": "pending"
            })
        else:
            response.append({
                "group_id": group.id,
                "group_name": group.name,
                "status": "available"
            })

    return response


@router.get("/status")
def get_invitation_status(
    sender_id: int,
    receiver_id: int,
    db: Session = Depends(get_db)
):
    # Are they already in a common group?
    common_group = (
        db.query(ResearchGroupMember)
        .join(
            ResearchGroupMember,
            ResearchGroupMember.group_id == ResearchGroupMember.group_id
        )
    )

    sender_groups = (
        db.query(ResearchGroupMember.group_id)
        .filter(ResearchGroupMember.user_id == sender_id)
        .subquery()
    )

    member = (
        db.query(ResearchGroupMember)
        .filter(
            ResearchGroupMember.user_id == receiver_id,
            ResearchGroupMember.group_id.in_(sender_groups)
        )
        .first()
    )

    if member:
        return {"status": "member"}

    invitation = (
        db.query(GroupInvitation)
        .filter(
            GroupInvitation.sender_id == sender_id,
            GroupInvitation.receiver_id == receiver_id,
            GroupInvitation.status == "Pending"
        )
        .first()
    )

    if invitation:
        return {"status": "pending"}

    return {"status": "none"}

@router.put("/accept/{invitation_id}")
def accept_invitation(
    invitation_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    invitation = (
        db.query(GroupInvitation)
        .filter(GroupInvitation.id == invitation_id)
        .first()
    )

    if not invitation:
        raise HTTPException(
            status_code=404,
            detail="Invitation not found"
        )

    if invitation.status != "Pending":
        raise HTTPException(
            status_code=400,
            detail="Invitation already processed"
        )
    if current_user.role != "System Admin" and invitation.receiver_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only the invited user can accept this invitation.")

    existing_member = (
        db.query(ResearchGroupMember)
        .filter(
            ResearchGroupMember.group_id == invitation.group_id,
            ResearchGroupMember.user_id == invitation.receiver_id
        )
        .first()
    )

    if existing_member:
        raise HTTPException(
            status_code=400,
            detail="User is already a member"
        )

    new_member = ResearchGroupMember(
        group_id=invitation.group_id,
        user_id=invitation.receiver_id,
        role="Researcher"
    )

    db.add(new_member)

    invitation.status = "Accepted"

    db.commit()

    return {
        "message": "Invitation accepted successfully"
    }

@router.put("/reject/{invitation_id}")
def reject_invitation(
    invitation_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    invitation = (
        db.query(GroupInvitation)
        .filter(GroupInvitation.id == invitation_id)
        .first()
    )

    if not invitation:
        raise HTTPException(
            status_code=404,
            detail="Invitation not found"
        )

    if invitation.status != "Pending":
        raise HTTPException(
            status_code=400,
            detail="Invitation already processed"
        )
    if current_user.role != "System Admin" and invitation.receiver_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only the invited user can reject this invitation.")

    invitation.status = "Rejected"

    db.commit()

    return {
        "message": "Invitation rejected successfully"
    }
