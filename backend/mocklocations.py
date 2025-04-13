from models import Location, Chain, Country
from database import SessionLocal
import random

# Create mock countries
def create_mock_countries(db):
    countries = [
        Country(name="USA"),
        Country(name="Germany"),
        Country(name="Tunisia"),
        Country(name="Canada"),
        Country(name="France"),
    ]
    db.add_all(countries)
    db.commit()

    for country in countries:
        db.refresh(country)

    return countries

# Create mock chains
def create_mock_chains(db, countries):
    chains = [
        Chain(name="Chain A", country_id=countries[0].id),
        Chain(name="Chain B", country_id=countries[1].id),
        Chain(name="Chain C", country_id=countries[2].id),
        Chain(name="Chain D", country_id=countries[3].id),
        Chain(name="Chain E", country_id=countries[4].id),
    ]
    db.add_all(chains)
    db.commit()

    for chain in chains:
        db.refresh(chain)

    return chains

# Create mock locations
def create_mock_locations(db, chains):
    locations = [
        Location(name="Warehouse A", chain_id=chains[0].id, current_stock_level=150, max_capacity=500, warehouse_threshold=0.1),
        Location(name="Warehouse B", chain_id=chains[1].id, current_stock_level=200, max_capacity=600, warehouse_threshold=0.15),
        Location(name="Warehouse C", chain_id=chains[2].id, current_stock_level=250, max_capacity=700, warehouse_threshold=0.2),
        Location(name="Store 1", chain_id=chains[3].id, current_stock_level=80, max_capacity=200, warehouse_threshold=0.1),
        Location(name="Store 2", chain_id=chains[4].id, current_stock_level=120, max_capacity=300, warehouse_threshold=0.12),
    ]
    db.add_all(locations)
    db.commit()

    for location in locations:
        db.refresh(location)

    return locations

# Main function to add mock data
def add_mock_data():
    db = SessionLocal()

    # Create mock countries
    countries = create_mock_countries(db)
    # Create mock chains
    chains = create_mock_chains(db, countries)
    # Create mock locations
    create_mock_locations(db, chains)

    db.close()

if __name__ == "__main__":
    add_mock_data()
