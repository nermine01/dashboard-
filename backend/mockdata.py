from models import Product, Group4, Group3, Group2, Group1, ProductLocation
from database import SessionLocal
import datetime
import random
from models import SalesForecast

# Create mock categories (Group1 ➔ Group2 ➔ Group3 ➔ Group4)
def create_mock_categories(db):
    group1 = Group1(name="Main Category")
    db.add(group1)
    db.commit()
    db.refresh(group1)

    # Group2 (Sub Category) referencing Group1
    group2 = Group2(name="Sub Category", parent_id=group1.id)
    db.add(group2)
    db.commit()
    db.refresh(group2)

    # Group3 (Detailed Category) referencing Group2
    group3 = Group3(name="Detailed Category", parent_id=group2.id)
    db.add(group3)
    db.commit()
    db.refresh(group3)

    # Group4 entries referencing Group3
    categories = [
        Group4(name="Electronics", parent_id=group3.id),
        Group4(name="Groceries", parent_id=group3.id),
        Group4(name="Beverages", parent_id=group3.id),
        Group4(name="Personal Care", parent_id=group3.id),
        Group4(name="Household Supplies", parent_id=group3.id),
    ]
    db.add_all(categories)
    db.commit()

    # Refresh Group4 entries after committing
    for category in categories:
        db.refresh(category)

    return categories

# Helper to generate random future expiration dates
def random_expiration():
    return datetime.datetime.now() + datetime.timedelta(days=random.randint(1, 5))

def create_mock_products(db, categories):
    products = [
        # Electronics
        Product(name="Laptop", category_id=categories[0].id),
        Product(name="Smartphone", category_id=categories[0].id),
        Product(name="Tablet", category_id=categories[0].id),
        Product(name="Bluetooth Speaker", category_id=categories[0].id),
        Product(name="Monitor", category_id=categories[0].id),

        # Groceries
        Product(name="Yogurt", category_id=categories[1].id, expiration_date=random_expiration()),
        Product(name="Milk", category_id=categories[1].id, expiration_date=random_expiration()),
        Product(name="Bread", category_id=categories[1].id, expiration_date=random_expiration()),
        Product(name="Eggs", category_id=categories[1].id, expiration_date=random_expiration()),
        Product(name="Butter", category_id=categories[1].id, expiration_date=random_expiration()),

        # Beverages
        Product(name="Orange Juice", category_id=categories[2].id, expiration_date=random_expiration()),
        Product(name="Cola", category_id=categories[2].id, expiration_date=random_expiration()),
        Product(name="Mineral Water", category_id=categories[2].id, expiration_date=random_expiration()),
        Product(name="Energy Drink", category_id=categories[2].id, expiration_date=random_expiration()),
        Product(name="Tea", category_id=categories[2].id, expiration_date=random_expiration()),

        # Personal Care
        Product(name="Shampoo", category_id=categories[3].id),
        Product(name="Toothpaste", category_id=categories[3].id),
        Product(name="Soap", category_id=categories[3].id),
        Product(name="Deodorant", category_id=categories[3].id),
        Product(name="Hand Sanitizer", category_id=categories[3].id),

        # Household Supplies
        Product(name="Laundry Detergent", category_id=categories[4].id),
        Product(name="Dish Soap", category_id=categories[4].id),
        Product(name="Toilet Paper", category_id=categories[4].id),
        Product(name="Trash Bags", category_id=categories[4].id),
        Product(name="All-Purpose Cleaner", category_id=categories[4].id),
    ]

    db.add_all(products)
    db.commit()

    for product in products:
        db.refresh(product)

        # Correct creation of ProductLocation
        product_location = ProductLocation(
            product_id=product.id,
            location_id=random.choice([1, 2, 3]),  # Mock locations
            supplier_id=random.choice([1, 2, 3]),  # Mock suppliers
            stock_level=random.randint(5, 100),
            reorder_point=random.randint(10, 30),
            max_stock=random.randint(50, 150)
        )
        db.add(product_location)

    db.commit()

    for product in products:
        for pl in product.product_locations:
            for days_ago in range(1, 4):
                forecast_date = datetime.date.today() - datetime.timedelta(days=days_ago)
                forecasted_sales = random.randint(20, 30)
                actual_sales = forecasted_sales - random.randint(11, 20)
                sales_forecast = SalesForecast(
                    product_location_id=pl.id,
                    date=forecast_date,
                    forecasted_sales=forecasted_sales,
                    actual_sales=actual_sales,
                    sales_last_year=forecasted_sales - random.randint(1, 5),
                    seasonal_deviation_threshold=5.0
                )
                db.add(sales_forecast)

    db.commit()

    return products

# Main function to add mock data
def add_mock_data():
    db = SessionLocal()

    categories = create_mock_categories(db)
    create_mock_products(db, categories)

    db.close()

if __name__ == "__main__":
    add_mock_data()
