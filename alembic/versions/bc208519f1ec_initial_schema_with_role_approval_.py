"""initial schema with role approval workflow

Revision ID: bc208519f1ec
Revises: 
Create Date: 2026-07-11 18:10:27.591738

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

user_status_enum = postgresql.ENUM(
    'PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED',
    name='user_status'
)

# revision identifiers, used by Alembic.
revision: str = 'bc208519f1ec'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # create the enum type first
    user_status_enum.create(op.get_bind(), checkfirst=True)

    op.add_column('users', sa.Column('status', user_status_enum, nullable=False, server_default='APPROVED'))
    op.add_column('users', sa.Column('must_reset_password', sa.Boolean(), nullable=False, server_default='false'))
    op.add_column('users', sa.Column('institution_id', sa.Integer(), nullable=True))
    op.add_column('users', sa.Column('created_by', sa.Integer(), nullable=True))
    op.add_column('users', sa.Column('approved_by', sa.Integer(), nullable=True))
    op.add_column('users', sa.Column('approved_at', sa.DateTime(timezone=True), nullable=True))
    op.create_foreign_key(None, 'users', 'users', ['created_by'], ['id'])
    op.create_foreign_key(None, 'users', 'institutions', ['institution_id'], ['id'])
    op.create_foreign_key(None, 'users', 'users', ['approved_by'], ['id'])


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_constraint(None, 'users', type_='foreignkey')
    op.drop_constraint(None, 'users', type_='foreignkey')
    op.drop_constraint(None, 'users', type_='foreignkey')
    op.drop_column('users', 'approved_at')
    op.drop_column('users', 'approved_by')
    op.drop_column('users', 'created_by')
    op.drop_column('users', 'institution_id')
    op.drop_column('users', 'must_reset_password')
    op.drop_column('users', 'status')

    user_status_enum.drop(op.get_bind(), checkfirst=True)
