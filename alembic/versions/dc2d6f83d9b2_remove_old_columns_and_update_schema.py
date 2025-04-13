"""remove old columns and update schema

Revision ID: dc2d6f83d9b2
Revises: a094635a62e7
Create Date: 2025-04-13 13:08:48.324058

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'dc2d6f83d9b2'
down_revision: Union[str, None] = 'a094635a62e7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('product_location', sa.Column('stock_level', sa.Integer(), nullable=True))
    op.add_column('product_location', sa.Column('reorder_point', sa.Integer(), nullable=False))
    op.add_column('product_location', sa.Column('max_stock', sa.Integer(), nullable=False))
    op.drop_column('products', 'max_stock')
    op.drop_column('products', 'stock_level')
    op.drop_column('products', 'reorder_point')
    # ### end Alembic commands ###


def downgrade() -> None:
    """Downgrade schema."""
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('products', sa.Column('reorder_point', sa.INTEGER(), autoincrement=False, nullable=False))
    op.add_column('products', sa.Column('stock_level', sa.INTEGER(), autoincrement=False, nullable=True))
    op.add_column('products', sa.Column('max_stock', sa.INTEGER(), autoincrement=False, nullable=False))
    op.drop_column('product_location', 'max_stock')
    op.drop_column('product_location', 'reorder_point')
    op.drop_column('product_location', 'stock_level')
    # ### end Alembic commands ###
