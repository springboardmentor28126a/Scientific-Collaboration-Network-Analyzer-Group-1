from pydantic import BaseModel, ConfigDict
from typing import Optional


class DepartmentCreate(BaseModel):
    institution_id: int
    department_name: str
    description: Optional[str] = None

class DepartmentUpdate(BaseModel):
    institution_id: int
    department_name: str
    description: Optional[str] = None

class DepartmentResponse(BaseModel):
    id: int
    institution_id: int
    department_name: str
    description: Optional[str]

    model_config = ConfigDict(
        from_attributes=True
    )