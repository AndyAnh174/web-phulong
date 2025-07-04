"""add featured to service

Revision ID: d6e9f8b53c1a
Revises: c5a8f7d42e5c
Create Date: 2024-01-15 10:30:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'd6e9f8b53c1a'
down_revision: Union[str, None] = 'c5a8f7d42e5c'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('services', sa.Column('featured', sa.Boolean(), nullable=True))
    
    # Set default value for existing records
    op.execute("UPDATE services SET featured = false WHERE featured IS NULL")
    
    # Make the column non-nullable after setting default values
    op.alter_column('services', 'featured', nullable=False)
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('services', 'featured')
    # ### end Alembic commands ### 