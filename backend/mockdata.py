from models import Product, Group4
from database import SessionLocal
import datetime

# Create mock categories (Group4)
def create_mock_categories(db):
    categories = [
        Group4(name="Category 1"),
        Group4(name="Category 2")
    ]
    db.add_all(categories)
    db.commit()

    # Refresh each category individually
    for category in categories:
        db.refresh(category)

    return categories

# Create mock products
def create_mock_products(db, categories):
    products = [
        Product(name="Product 1", category_id=categories[0].id, stock_level=50, reorder_point=10, max_stock=100, expiration_date=datetime.datetime(2025, 12, 31)),
        Product(name="Product 2", category_id=categories[1].id, stock_level=5, reorder_point=10, max_stock=50, expiration_date=datetime.datetime(2025, 6, 30)),
        Product(name="Product 3", category_id=categories[0].id, stock_level=120, reorder_point=50, max_stock=150, expiration_date=datetime.datetime(2025, 4, 30)),
    ]
    db.add_all(products)
    db.commit()

    # Refresh each product individually
    for product in products:
        db.refresh(product)

    return products

# Main function to add mock data
def add_mock_data():
    db = SessionLocal()
    
    # Create mock categories
    categories = create_mock_categories(db)
    
    # Create mock products
    create_mock_products(db, categories)
    
    db.close()

# Run the mock data population
if __name__ == "__main__":
    add_mock_data()
