"""add_expires_at_to_admin_access_logs

Revision ID: b4fa8a5ec62c
Revises: 
Create Date: 2024-11-07 12:50:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from datetime import datetime, timedelta

# revision identifiers, used by Alembic.
revision: str = 'b4fa8a5ec62c'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Thêm cột expires_at vào bảng admin_access_logs
    op.add_column('admin_access_logs', sa.Column('expires_at', sa.DateTime(), nullable=True))
    
    # Cập nhật các giá trị hiện có - expires_at = timestamp + 3 tháng
    op.execute("""
        UPDATE admin_access_logs 
        SET expires_at = timestamp + INTERVAL '3 month'
    """)


def downgrade() -> None:
    # Xóa cột expires_at khỏi bảng admin_access_logs
    op.drop_column('admin_access_logs', 'expires_at') 