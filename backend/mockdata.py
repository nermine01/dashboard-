from models import (
    Product, Group4, Group3, Group2, Group1,
    ProductLocation, SalesForecast, Supplier, Location,
    Transaction, DeliverySchedule, OrderProposal, Campaign
)
from database import SessionLocal
import datetime
import random

# Utility
def random_expiration(days_ahead=30):
    return datetime.date.today() + datetime.timedelta(days=days_ahead)

def create_mock_suppliers(db):
    existing_supplier_names = {s.name for s in db.query(Supplier).all()}
    new_suppliers = [
        Supplier(
            name="Supplier A",
            performance_score=60.0,  # Triggers supplier_alert
            on_time_delivery_rate=70.0,  # Triggers supplier_performance
            quality_rating=88.0,
            contract_end_date=datetime.date.today() + datetime.timedelta(days=15),  # Triggers supplier_contract_expiration
            current_capacity=80,  # Triggers supplier_capacity
            min_capacity_threshold=100
        ),
        Supplier(
            name="Supplier B",
            performance_score=85.0,
            on_time_delivery_rate=90.0,
            quality_rating=92.0,
            contract_end_date=datetime.date.today() + datetime.timedelta(days=60),
            current_capacity=120,
            min_capacity_threshold=100
        ),
        Supplier(
            name="Supplier C",
            performance_score=75.0,
            on_time_delivery_rate=85.0,
            quality_rating=90.0,
            contract_end_date=datetime.date.today() + datetime.timedelta(days=45),
            current_capacity=95,
            min_capacity_threshold=90
        ),
    ]
    # Filter out suppliers that already exist to avoid duplicates
    suppliers_to_add = [s for s in new_suppliers if s.name not in existing_supplier_names]
    db.add_all(suppliers_to_add)
    db.commit()
    return suppliers_to_add

def create_mock_locations(db):
    locations = [
        Location(name="Warehouse A", current_stock_level=950, max_capacity=1000, chain_id=1)
    ]
    db.add_all(locations)
    db.commit()
    return locations

def create_hierarchical_products(db, location, supplier):
    # Each tuple: (Division, Department, Category, Subcategory)
    hierarchy_data = [
        # Grocery > Snacks & Sweets > Chips, Chocolate, Candy, Crackers
        ("Grocery", "Snacks & Sweets", "Chips", "Salted Chips"),
        ("Grocery", "Snacks & Sweets", "Chips", "BBQ Chips"),
        ("Grocery", "Snacks & Sweets", "Chocolate", "Milk Chocolate"),
        ("Grocery", "Snacks & Sweets", "Chocolate", "Dark Chocolate"),
        ("Grocery", "Snacks & Sweets", "Candy", "Gummy Bears"),
        ("Grocery", "Snacks & Sweets", "Candy", "Lollipops"),
        ("Grocery", "Snacks & Sweets", "Crackers", "Cheese Crackers"),
        ("Grocery", "Snacks & Sweets", "Crackers", "Butter Crackers"),

        # Grocery > Beverages > Juice, Soda, Water, Energy Drinks
        ("Grocery", "Beverages", "Juice", "Orange Juice"),
        ("Grocery", "Beverages", "Juice", "Apple Juice"),
        ("Grocery", "Beverages", "Soda", "Cola"),
        ("Grocery", "Beverages", "Soda", "Root Beer"),
        ("Grocery", "Beverages", "Water", "Mineral Water"),
        ("Grocery", "Beverages", "Water", "Sparkling Water"),
        ("Grocery", "Beverages", "Energy Drinks", "Red Energy"),
        ("Grocery", "Beverages", "Energy Drinks", "Blue Blast"),

        # Household > Cleaning Supplies > Laundry, Surface, Bathroom, Kitchen
        ("Household", "Cleaning Supplies", "Laundry", "Liquid Detergent"),
        ("Household", "Cleaning Supplies", "Laundry", "Fabric Softener"),
        ("Household", "Cleaning Supplies", "Surface Cleaners", "Glass Cleaner"),
        ("Household", "Cleaning Supplies", "Surface Cleaners", "Floor Cleaner"),
        ("Household", "Cleaning Supplies", "Bathroom Cleaners", "Tile Cleaner"),
        ("Household", "Cleaning Supplies", "Bathroom Cleaners", "Mold Remover"),
        ("Household", "Cleaning Supplies", "Kitchen Cleaners", "Oven Cleaner"),
        ("Household", "Cleaning Supplies", "Kitchen Cleaners", "Stovetop Spray"),

        # Household > Paper Goods > Towels, Toilet Paper, Napkins, Tissues
        ("Household", "Paper Goods", "Towels", "Paper Towels"),
        ("Household", "Paper Goods", "Towels", "Reusable Towels"),
        ("Household", "Paper Goods", "Toilet Paper", "4-Ply Toilet Paper"),
        ("Household", "Paper Goods", "Toilet Paper", "Eco Toilet Paper"),
        ("Household", "Paper Goods", "Napkins", "Lunch Napkins"),
        ("Household", "Paper Goods", "Napkins", "Dinner Napkins"),
        ("Household", "Paper Goods", "Tissues", "Pocket Tissues"),
        ("Household", "Paper Goods", "Tissues", "Soft Tissues"),
    ]

    group1_map, group2_map, group3_map, group4_map = {}, {}, {}, {}
    products = []

    for g1, g2, g3, g4 in hierarchy_data:
        # Group1 - Division
        if g1 not in group1_map:
            g1_obj = Group1(name=g1)
            db.add(g1_obj)
            db.commit()
            db.refresh(g1_obj)
            group1_map[g1] = g1_obj
        else:
            g1_obj = group1_map[g1]

        # Group2 - Department
        g2_key = (g2, g1_obj.id)
        if g2_key not in group2_map:
            g2_obj = Group2(name=g2, parent_id=g1_obj.id)
            db.add(g2_obj)
            db.commit()
            db.refresh(g2_obj)
            group2_map[g2_key] = g2_obj
        else:
            g2_obj = group2_map[g2_key]

        # Group3 - Category
        g3_key = (g3, g2_obj.id)
        if g3_key not in group3_map:
            g3_obj = Group3(name=g3, parent_id=g2_obj.id)
            db.add(g3_obj)
            db.commit()
            db.refresh(g3_obj)
            group3_map[g3_key] = g3_obj
        else:
            g3_obj = group3_map[g3_key]

        # Group4 - Subcategory
        g4_key = (g4, g3_obj.id)
        if g4_key not in group4_map:
            g4_obj = Group4(name=g4, parent_id=g3_obj.id)
            db.add(g4_obj)
            db.commit()
            db.refresh(g4_obj)
            group4_map[g4_key] = g4_obj
        else:
            g4_obj = group4_map[g4_key]

        # Generate 1 product per Group4 entry (32 total)
        omit_exp = random.random() < 0.2
        omit_launch = random.random() < 0.2
        omit_lifecycle = random.random() < 0.2
        swap_dates = random.random() < 0.15

        expiration = None if omit_exp else random_expiration(random.randint(5, 40))
        launch = None if omit_launch else datetime.date.today() - datetime.timedelta(days=random.randint(10, 180))
        lifecycle = None if omit_lifecycle else random.choice(["Active", "Discontinued"])

        if expiration and launch and swap_dates:
            launch, expiration = expiration, launch  # force incorrect_input

        product = Product(
            name=g4,
            category_id=g4_obj.id,
            expiration_date=expiration,
            launch_date=launch,
            lifecycle_status=lifecycle,
            recall_status=random.choice([True, False])
        )
        db.add(product)
        db.commit()
        db.refresh(product)

        pl = ProductLocation(
            product_id=product.id,
            location_id=location.id,
            supplier_id=supplier.id,
            stock_level=random.choice([5, 15, 50, 130]),
            reorder_point=20,
            max_stock=100
        )
        db.add(pl)
        db.commit()
        products.append(product)

    # Forecasts
    for product in products:
        for pl in product.product_locations:
            for days_ago in range(1, 4):
                forecast_date = datetime.date.today() - datetime.timedelta(days=days_ago)
                forecasted_sales = random.randint(25, 40)
                actual_sales = forecasted_sales - random.randint(10, 20)
                forecast = SalesForecast(
                    product_location_id=pl.id,
                    date=forecast_date,
                    forecasted_sales=forecasted_sales,
                    actual_sales=actual_sales,
                    sales_last_year=forecasted_sales - random.randint(5, 15),
                    seasonal_deviation_threshold=5.0
                )
                db.add(forecast)

    db.commit()
    return products



def create_mock_transactions(db, product_locations):
    today = datetime.date.today()
    for pl in product_locations:
        for i in range(10):
            txn = Transaction(
                product_location_id=pl.id,
                date=today - datetime.timedelta(days=i),
                sold_quantity=random.randint(10, 25),
                recorded_stock=random.randint(30, 100),
                damaged_quantity=random.choice([0, 2, 5]),  # High damage triggers alert
                received_quantity=random.randint(50, 90),
                returned_quantity=random.choice([0, 5])
            )
            db.add(txn)
    db.commit()

def create_mock_deliveries(db, product_locations):
    today = datetime.date.today()
    for pl in product_locations:
        delivery = DeliverySchedule(
            product_location_id=pl.id,
            expected_delivery_date=today - datetime.timedelta(days=3),
            actual_delivery_date=None,
            expected_quantity=100,
            received_quantity=80,
            delivery_status="Rejected"  # Triggers multiple alerts
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
            received_quantity=60,  # Triggers mismatch
            order_date=today - datetime.timedelta(days=30),
            received_date=today - datetime.timedelta(days=5),
            expected_lead_time=10,
            mismatch_tolerance=5.0,
            status="Cancelled"  # Triggers cancellation alert
        )
        db.add(order)
    db.commit()

def create_mock_promotions(db):
    promo = Campaign(
        promotion_start_date=datetime.date.today() + datetime.timedelta(days=5)
    )
    db.add(promo)
    db.commit()

def add_mock_data():
    db = SessionLocal()
    suppliers = create_mock_suppliers(db)
    locations = create_mock_locations(db)

    products = create_hierarchical_products(db, locations[0], suppliers[0])
    all_product_locations = db.query(ProductLocation).all()

    create_mock_transactions(db, all_product_locations)
    create_mock_deliveries(db, all_product_locations)
    create_mock_order_proposals(db, all_product_locations)
    create_mock_promotions(db)

    db.close()

if __name__ == "__main__":
    add_mock_data()
