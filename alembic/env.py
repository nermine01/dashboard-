import sys
from logging.config import fileConfig
from sqlalchemy import engine_from_config, pool
from alembic import context
from dotenv import load_dotenv
import os

# Load environment variables from the .env file
load_dotenv()

# Add your project to the sys.path if it's not already there
import sys
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend")))



import backend.models as models

Base = models.Base
Product = models.Product
Alert = models.Alert
Group4 = models.Group4
Group3 = models.Group3
Group2 = models.Group2
Group1 = models.Group1
Location = models.Location
Chain = models.Chain
Country = models.Country
Supplier = models.Supplier
ProductLocation = models.ProductLocation
ProductLocationCampaign = models.ProductLocationCampaign
LocationSupplier = models.LocationSupplier
DeliverySchedule = models.DeliverySchedule
Transaction = models.Transaction
SalesForecast = models.SalesForecast
OrderProposal = models.OrderProposal
Campaign = models.Campaign




# This is the target metadata to be used by Alembic for generating migrations
target_metadata = Base.metadata

# Load the Alembic configuration file
config = context.config

# Set up logging as per the configuration file
fileConfig(config.config_file_name)

# Get the database URL from the environment variable (from the .env file)
database_url = os.getenv("SQLALCHEMY_DATABASE_URL")

# Database connection setup
connectable = engine_from_config(
    config.get_section(config.config_ini_section),
    prefix='sqlalchemy.',
    poolclass=pool.NullPool
)

# Define the function to run migrations in 'offline' mode
def run_migrations_offline():
    """Run migrations in 'offline' mode."""
    context.configure(url=database_url, target_metadata=target_metadata, literal_binds=True)

    with context.begin_transaction():
        context.run_migrations()

# Define the function to run migrations in 'online' mode
def run_migrations_online():
    """Run migrations in 'online' mode."""
    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)

        with context.begin_transaction():
            context.run_migrations()

# This is the entry point for Alembic when running commands
if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
