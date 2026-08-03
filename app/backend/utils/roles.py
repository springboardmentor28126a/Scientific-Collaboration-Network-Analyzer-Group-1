from enum import Enum

class UserRole(str, Enum):
    SYSTEM_ADMIN = "system_admin"
    INSTITUTION_ADMIN = "institution_admin"
    RESEARCHER = "researcher"