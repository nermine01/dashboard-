from models import Product, Group4
from database import SessionLocal
import datetime
import random

# Create mock categories (Group4)
def create_mock_categories(db):
    categories = [
        Group4(name="Electronics"),
        Group4(name="Groceries"),
        Group4(name="Beverages"),
        Group4(name="Personal Care"),
        Group4(name="Household Supplies"),
    ]
    db.add_all(categories)
    db.commit()

    for category in categories:
        db.refresh(category)

    return categories

# Helper to generate random future expiration dates
def random_expiration():
    # Expiration close to now will trigger alerts
    return datetime.datetime.now() + datetime.timedelta(days=random.randint(1, 5))

# Create mock products
def create_mock_products(db, categories):
    products = [
        # Electronics
        Product(name="Laptop", category_id=categories[0].id, stock_level=2, reorder_point=5, max_stock=50),  # Low stock to trigger alert
        Product(name="Smartphone", category_id=categories[0].id, stock_level=10, reorder_point=10, max_stock=30),
        Product(name="Tablet", category_id=categories[0].id, stock_level=15, reorder_point=5, max_stock=25),
        Product(name="Bluetooth Speaker", category_id=categories[0].id, stock_level=8, reorder_point=3, max_stock=20),
        Product(name="Monitor", category_id=categories[0].id, stock_level=12, reorder_point=4, max_stock=30),

        # Groceries
        Product(name="Yogurt", category_id=categories[1].id, stock_level=100, reorder_point=30, max_stock=200, expiration_date=random_expiration()),
        Product(name="Milk", category_id=categories[1].id, stock_level=5, reorder_point=20, max_stock=100, expiration_date=random_expiration()),  # Expiration close to now
        Product(name="Bread", category_id=categories[1].id, stock_level=40, reorder_point=15, max_stock=80, expiration_date=random_expiration()),
        Product(name="Eggs", category_id=categories[1].id, stock_level=60, reorder_point=25, max_stock=120, expiration_date=random_expiration()),
        Product(name="Butter", category_id=categories[1].id, stock_level=30, reorder_point=10, max_stock=60, expiration_date=random_expiration()),

        # Beverages
        Product(name="Orange Juice", category_id=categories[2].id, stock_level=70, reorder_point=20, max_stock=150, expiration_date=random_expiration()),
        Product(name="Cola", category_id=categories[2].id, stock_level=90, reorder_point=25, max_stock=180, expiration_date=random_expiration()),
        Product(name="Mineral Water", category_id=categories[2].id, stock_level=120, reorder_point=50, max_stock=200, expiration_date=random_expiration()),
        Product(name="Energy Drink", category_id=categories[2].id, stock_level=40, reorder_point=15, max_stock=90, expiration_date=random_expiration()),
        Product(name="Tea", category_id=categories[2].id, stock_level=60, reorder_point=20, max_stock=100, expiration_date=random_expiration()),

        # Personal Care
        Product(name="Shampoo", category_id=categories[3].id, stock_level=45, reorder_point=10, max_stock=70),
        Product(name="Toothpaste", category_id=categories[3].id, stock_level=55, reorder_point=15, max_stock=90),
        Product(name="Soap", category_id=categories[3].id, stock_level=80, reorder_point=20, max_stock=150),
        Product(name="Deodorant", category_id=categories[3].id, stock_level=35, reorder_point=10, max_stock=60),
        Product(name="Hand Sanitizer", category_id=categories[3].id, stock_level=60, reorder_point=20, max_stock=100),

        # Household Supplies
        Product(name="Laundry Detergent", category_id=categories[4].id, stock_level=50, reorder_point=15, max_stock=100),
        Product(name="Dish Soap", category_id=categories[4].id, stock_level=30, reorder_point=10, max_stock=80),
        Product(name="Toilet Paper", category_id=categories[4].id, stock_level=100, reorder_point=40, max_stock=200),
        Product(name="Trash Bags", category_id=categories[4].id, stock_level=70, reorder_point=30, max_stock=150),
        Product(name="All-Purpose Cleaner", category_id=categories[4].id, stock_level=40, reorder_point=15, max_stock=90),
    ]

    db.add_all(products)
    db.commit()

    for product in products:
        db.refresh(product)

    return products

# Main function to add mock data
def add_mock_data():
    db = SessionLocal()

    categories = create_mock_categories(db)
    create_mock_products(db, categories)

    db.close()

if __name__ == "__main__":
    add_mock_data()
