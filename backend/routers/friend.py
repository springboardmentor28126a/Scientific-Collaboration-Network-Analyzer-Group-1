from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.database.database import get_db
from backend.database.models import ActivityEvent, Notification, User
from backend.models.friend_request import FriendRequest
from backend.models.direct_conversation import DirectConversation
from backend.schemas.friend import (
    FriendRequestCreate,
    FriendRequestResponse
)
from backend.utils.security import get_current_user

router = APIRouter(
    prefix="/friends",
    tags=["Friends"]
)
@router.post(
    "/send-request",
    response_model=FriendRequestResponse
)
def send_friend_request(
    request: FriendRequestCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    if current_user.id == request.receiver_id:
        raise HTTPException(
            status_code=400,
            detail="You cannot send a friend request to yourself."
        )

    receiver = db.query(User).filter(
        User.id == request.receiver_id
    ).first()

    if not receiver:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    existing = (
        db.query(FriendRequest)
        .filter(
            (
                (FriendRequest.sender_id == current_user.id) &
                (FriendRequest.receiver_id == request.receiver_id)
            ) |
            (
                (FriendRequest.sender_id == request.receiver_id) &
                (FriendRequest.receiver_id == current_user.id)
            )
        )
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Friend request already exists."
        )

    friend_request = FriendRequest(
        sender_id=current_user.id,
        receiver_id=request.receiver_id,
        status="Pending"
    )

    db.add(friend_request)
    db.add(Notification(
        user_id=receiver.id,
        title="New collaboration request",
        message=f"{current_user.name} sent you a collaboration request.",
        notification_type="collaboration_request",
        resource_type="friend_request",
    ))
    db.add(ActivityEvent(
        user_id=current_user.id,
        event_type="collaboration_requested",
        description=f"Collaboration requested with {receiver.name}",
        resource_type="friend_request",
    ))
    db.commit()
    db.refresh(friend_request)

    return friend_request

@router.get("/requests/{user_id}")
def get_friend_requests(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "System Admin" and user_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can view only your own requests.")

    requests = (
        db.query(FriendRequest, User)
        .join(User, User.id == FriendRequest.sender_id)
        .filter(
            FriendRequest.receiver_id == user_id,
            FriendRequest.status == "Pending"
        )
        .all()
    )

    return [
        {
            "request_id": request.id,
            "sender_id": sender.id,
            "sender_name": sender.name,
            "sender_email": sender.email,
            "status": request.status,
            "created_at": request.created_at
        }
        for request, sender in requests
    ]


@router.get("/sent/{user_id}")
def get_sent_friend_requests(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role != "System Admin" and user_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can view only your own requests.")

    requests = db.query(FriendRequest, User).join(
        User, User.id == FriendRequest.receiver_id
    ).filter(FriendRequest.sender_id == user_id).order_by(FriendRequest.created_at.desc()).all()
    return [
        {
            "id": request.id,
            "receiver_id": receiver.id,
            "receiver_name": receiver.name,
            "institution": receiver.institution_name,
            "department": receiver.department,
            "status": request.status,
            "created_at": request.created_at,
        }
        for request, receiver in requests
    ]

@router.put("/accept/{request_id}")
def accept_friend_request(
    request_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    friend_request = (
        db.query(FriendRequest)
        .filter(FriendRequest.id == request_id)
        .first()
    )

    if not friend_request:
        raise HTTPException(
            status_code=404,
            detail="Friend request not found"
        )

    if current_user.role != "System Admin" and friend_request.receiver_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only the recipient can accept this request.")

    if friend_request.status != "Pending":
        raise HTTPException(
            status_code=400,
            detail="Request already processed"
        )

    friend_request.status = "Accepted"

    existing = (
        db.query(DirectConversation)
        .filter(
            (
                (DirectConversation.user1_id == friend_request.sender_id) &
                (DirectConversation.user2_id == friend_request.receiver_id)
            ) |
            (
                (DirectConversation.user1_id == friend_request.receiver_id) &
                (DirectConversation.user2_id == friend_request.sender_id)
            )
        )
        .first()
    )

    if not existing:

        conversation = DirectConversation(
            user1_id=friend_request.sender_id,
            user2_id=friend_request.receiver_id
        )

        db.add(conversation)

    db.add(Notification(
        user_id=friend_request.sender_id,
        title="Collaboration request accepted",
        message=f"{current_user.name} accepted your collaboration request.",
        notification_type="collaboration_accepted",
        resource_type="friend_request",
        resource_id=friend_request.id,
    ))

    db.commit()

    return {
        "message": "Friend request accepted successfully"
    }

@router.put("/reject/{request_id}")
def reject_friend_request(
    request_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    friend_request = (
        db.query(FriendRequest)
        .filter(FriendRequest.id == request_id)
        .first()
    )

    if not friend_request:
        raise HTTPException(
            status_code=404,
            detail="Friend request not found"
        )

    if current_user.role != "System Admin" and friend_request.receiver_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only the recipient can reject this request.")

    if friend_request.status != "Pending":
        raise HTTPException(
            status_code=400,
            detail="Request already processed"
        )

    friend_request.status = "Rejected"

    db.commit()

    return {
        "message": "Friend request rejected successfully"
    }
@router.get("/list/{user_id}")
def get_friend_list(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "System Admin" and user_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can view only your own collaboration list.")

    conversations = (
        db.query(DirectConversation)
        .filter(
            (DirectConversation.user1_id == user_id) |
            (DirectConversation.user2_id == user_id)
        )
        .all()
    )

    friends = []

    for conversation in conversations:

        friend_id = (
            conversation.user2_id
            if conversation.user1_id == user_id
            else conversation.user1_id
        )

        friend = (
            db.query(User)
            .filter(User.id == friend_id)
            .first()
        )

        if friend:
            friends.append({
                "conversation_id": conversation.id,
                "user_id": friend.id,
                "name": friend.name,
                "email": friend.email,
                "institution": friend.institution_name
            })

    return friends
