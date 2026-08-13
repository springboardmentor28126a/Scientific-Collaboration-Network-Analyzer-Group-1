"""merge heads

Revision ID: ab0abf0c6cb6
Revises: 27254b92f236, a93b1c72f1cf
Create Date: 2026-08-13 13:30:26.992269

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'ab0abf0c6cb6'
down_revision: Union[str, Sequence[str], None] = ('27254b92f236', 'a93b1c72f1cf')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
