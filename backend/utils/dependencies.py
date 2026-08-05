from fastapi import Depends, HTTPException

from backend.database.models import User

from backend.utils.security import get_current_user

from backend.utils.permissions import ROLE_PERMISSIONS


# =====================================================
# Permission + Verification Checker
# =====================================================

def require_permission(permission):

    def checker(

        current_user: User = Depends(get_current_user)

    ):

        # ---------------------------------
        # System Admin has full access
        # ---------------------------------

        if current_user.role == "System Admin":

            return current_user

        if getattr(current_user, "account_status", "Active") != "Active":
            raise HTTPException(
                status_code=403,
                detail="Your account is blocked or suspended. Contact a System Administrator.",
            )

        # ---------------------------------
        # User must be verified first
        # ---------------------------------

        if not current_user.is_verified:

            raise HTTPException(

                status_code=403,

                detail="Your account is awaiting verification. Please wait until it is approved."

            )

        # ---------------------------------
        # Role Permission Check
        # ---------------------------------

        permissions = ROLE_PERMISSIONS.get(

            current_user.role,

            set()

        )

        if (

            "*" not in permissions

            and permission not in permissions

        ):

            raise HTTPException(

                status_code=403,

                detail="Permission denied."

            )

        return current_user

    return checker


# =====================================================
# Optional Verification Checker
# =====================================================
# Use this only if you need to check verification
# without checking a specific permission.
# Most routers will NOT need this anymore.
# =====================================================

def require_verified_user(

    current_user: User = Depends(get_current_user)

):

    if current_user.role == "System Admin":

        return current_user

    if getattr(current_user, "account_status", "Active") != "Active":
        raise HTTPException(
            status_code=403,
            detail="Your account is blocked or suspended. Contact a System Administrator.",
        )

    if not current_user.is_verified:

        raise HTTPException(

            status_code=403,

            detail="Your account is awaiting verification."

        )

    return current_user
