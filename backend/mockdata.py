from models import (
    Product, Group4, Group3, Group2, Group1,
    ProductLocation, SalesForecast, Supplier, Location, Transaction,
    DeliverySchedule, OrderProposal, Campaign
)
from database import SessionLocal
import datetime
import random

# Create mock categories
def create_mock_categories(db):
    group1 = Group1(name="Main Category")
    db.add(group1)
    db.commit()
    db.refresh(group1)

    group2 = Group2(name="Sub Category", parent_id=group1.id)
    db.add(group2)
    db.commit()
    db.refresh(group2)

    group3 = Group3(name="Detailed Category", parent_id=group2.id)
    db.add(group3)
    db.commit()
    db.refresh(group3)

    categories = [
        Group4(name="Electronics", parent_id=group3.id),
        Group4(name="Groceries", parent_id=group3.id),
        Group4(name="Beverages", parent_id=group3.id),
        Group4(name="Personal Care", parent_id=group3.id),
        Group4(name="Household Supplies", parent_id=group3.id),
    ]
    db.add_all(categories)
    db.commit()

    for category in categories:
        db.refresh(category)

    return categories

# Random expiration helper
def random_expiration(days_ahead=30):
    return datetime.date.today() + datetime.timedelta(days=days_ahead)

# Create mock products
def create_mock_products(db, categories):
    products = [
        Product(name="Laptop Recall", category_id=categories[0].id, launch_date=datetime.date.today() - datetime.timedelta(days=5)),
        Product(name="Old Product", category_id=categories[1].id, launch_date=datetime.date.today() - datetime.timedelta(days=200)),
        Product(name="Milk", category_id=categories[1].id, expiration_date=random_expiration(5), launch_date=datetime.date.today() - datetime.timedelta(days=5)),
        Product(name="Unnamed Product", category_id=categories[2].id, expiration_date=None, launch_date=None, lifecycle_status=None),
        Product(name="Trash Bags", category_id=categories[3].id, expiration_date=datetime.date.today() - datetime.timedelta(days=2), launch_date=datetime.date.today() + datetime.timedelta(days=5), lifecycle_status="Discontinued")
    ]

    db.add_all(products)
    db.commit()

    for product in products:
        db.refresh(product)

        # Attach locations
        product_location = ProductLocation(
            product_id=product.id,
            location_id=1,
            supplier_id=1,
            stock_level=random.choice([5, 10, 90, 110]),  # Low, normal, overstock
            reorder_point=20,
            max_stock=100
        )
        db.add(product_location)

    db.commit()

    # Create forecasts
    for product in products:
        for pl in product.product_locations:
            for days_ago in range(1, 4):
                forecast_date = datetime.date.today() - datetime.timedelta(days=days_ago)
                forecasted_sales = random.randint(30, 50)  # Big enough to trigger bias
                actual_sales = forecasted_sales - random.randint(15, 20)  # strong over-forecasting
                sales_forecast = SalesForecast(
                    product_location_id=pl.id,
                    date=forecast_date,
                    forecasted_sales=forecasted_sales,
                    actual_sales=actual_sales,
                    sales_last_year=forecasted_sales - random.randint(5, 10),
                    seasonal_deviation_threshold=5.0
                )
                db.add(sales_forecast)

    db.commit()

    return products

# Create suppliers
def create_mock_suppliers(db):
    suppliers = [
        Supplier(name="Supplier A", performance_score=65.0, on_time_delivery_rate=70.0, quality_rating=85.0, contract_end_date=datetime.date.today() + datetime.timedelta(days=20), current_capacity=80, min_capacity_threshold=100),
        Supplier(name="Supplier B", performance_score=90.0, on_time_delivery_rate=95.0, quality_rating=90.0, contract_end_date=datetime.date.today() + datetime.timedelta(days=365), current_capacity=200, min_capacity_threshold=100)
    ]
    db.add_all(suppliers)
    db.commit()

def create_mock_locations(db):
    locations = [
        Location(name="Warehouse A", current_stock_level=950, max_capacity=1000, chain_id=1),
        Location(name="Warehouse B", current_stock_level=450, max_capacity=1000, chain_id=1)
    ]
    db.add_all(locations)
    db.commit()

def create_mock_transactions(db, product_locations):
    today = datetime.date.today()
    for pl in product_locations:
        for i in range(10):
            txn = Transaction(
                product_location_id=pl.id,
                date=today - datetime.timedelta(days=i),
                sold_quantity=random.randint(15, 30),
                recorded_stock=random.randint(50, 100),
                damaged_quantity=random.choice([1, 2]),  # Force damaged goods
                received_quantity=random.randint(50, 100),
                returned_quantity=random.choice([3, 5])  # Force returned items
            )
            db.add(txn)

        # Add an extra transaction with returns
        txn = Transaction(
            product_location_id=pl.id,
            date=today,
            sold_quantity=10,
            recorded_stock=50,
            damaged_quantity=0,
            received_quantity=50,
            returned_quantity=5  # Force returns to trigger return_alert
        )
        db.add(txn)

    db.commit()

def create_mock_deliveries(db, product_locations):
    today = datetime.date.today()
    for pl in product_locations:
        delivery = DeliverySchedule(
            product_location_id=pl.id,
            expected_delivery_date=today - datetime.timedelta(days=2),
            actual_delivery_date=None,
            expected_quantity=100,
            received_quantity=90,
            delivery_status="Rejected"  # Force rejected status
        )
        db.add(delivery)
    db.commit()

def create_mock_order_proposals(db, product_locations):
    today = datetime.date.today()
    for pl in product_locations:
        order = OrderProposal(
            product_location_id=pl.id,
            date=today - datetime.timedelta(days=20),
            expected_quantity=100,
            received_quantity=80,
            order_date=today - datetime.timedelta(days=30),
            received_date=today - datetime.timedelta(days=5),
            expected_lead_time=10,
            mismatch_tolerance=5.0,
            status="Cancelled"
        )
        db.add(order)
    db.commit()

def create_mock_promotions(db):
    promo = Campaign(
        promotion_start_date=datetime.date.today() + datetime.timedelta(days=5)
    )
    db.add(promo)
    db.commit()

# Main function to insert all mock data
def add_mock_data():
    db = SessionLocal()

    categories = create_mock_categories(db)
    create_mock_products(db, categories)
    create_mock_suppliers(db)
    create_mock_locations(db)

    all_product_locations = db.query(ProductLocation).all()

    create_mock_transactions(db, all_product_locations)
    create_mock_deliveries(db, all_product_locations)
    create_mock_order_proposals(db, all_product_locations)
    create_mock_promotions(db)

    db.close()

if __name__ == "__main__":
    add_mock_data()
