from pydantic import BaseModel
from typing import Optional


# =========================================================
# BASE
# =========================================================

class DepartmentBase(BaseModel):
    institution_id: Optional[int] = None
    name: str
    description: Optional[str] = None


# =========================================================
# CREATE
# =========================================================

class DepartmentCreate(DepartmentBase):
    pass


# =========================================================
# UPDATE
# =========================================================

class DepartmentUpdate(BaseModel):
    institution_id: Optional[int] = None
    name: Optional[str] = None
    description: Optional[str] = None


# =========================================================
# OUTPUT
# =========================================================

class DepartmentOut(DepartmentBase):
    id: int

    class Config:
        from_attributes = True