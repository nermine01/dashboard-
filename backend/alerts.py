from datetime import datetime
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.events import EVENT_JOB_EXECUTED, EVENT_JOB_ERROR
from models import Product, Alert, SalesForecast
from database import SessionLocal
from sqlalchemy.orm import Session

# Function to insert alerts into the database
def insert_alert(db: Session, alert_type: str, message: str, product_id: int):
    alert = Alert(
        product_id=product_id,
        alert_type=alert_type,
        message=message,
        timestamp=datetime.now()
    )
    db.add(alert)
    db.commit()
    db.refresh(alert)
    return alert

# Function to check overstock condition
def check_overstock(db: Session):
    overstock_alerts = []
    products = db.query(Product).all()
    for product in products:
        if product.stock_level > product.max_stock:
            message = f"ALERT: {product.name} is overstocked. Stock: {product.stock_level} (Max: {product.max_stock})"
            overstock_alerts.append(message)
            insert_alert(db, "overstock", message, product.id)
    return overstock_alerts

# Function to check low stock condition
def check_low_stock(db: Session):
    low_stock_alerts = []
    products = db.query(Product).all()
    for product in products:
        if product.stock_level < product.reorder_point:
            message = f"ALERT: {product.name} has low stock. Stock: {product.stock_level} (Reorder Point: {product.reorder_point})"
            low_stock_alerts.append(message)
            insert_alert(db, "low_stock", message, product.id)
    return low_stock_alerts

# Function to check stock shrinkage
def check_stock_shrinkage(db: Session):
    shrinkage_alerts = []
    products = db.query(Product).all()
    for product in products:
        ideal_stock_level = product.max_stock
        if product.stock_level < ideal_stock_level * 0.90:
            message = f"ALERT: Possible shrinkage detected in {product.name}. Stock: {product.stock_level} (Ideal: {ideal_stock_level})"
            shrinkage_alerts.append(message)
            insert_alert(db, "shrinkage", message, product.id)
    return shrinkage_alerts

# Function to check products near expiration
def check_near_expiration(db: Session):
    near_expiration_alerts = []
    products = db.query(Product).all()
    current_date = datetime.now().date()
    for product in products:
        if product.expiration_date and (product.expiration_date - current_date).days <= 30:
            message = f"ALERT: {product.name} is near expiration. Expiry Date: {product.expiration_date}"
            near_expiration_alerts.append(message)
            insert_alert(db, "near_expiration", message, product.id)
    return near_expiration_alerts

# Function to check products near end of life
def check_near_end_of_life(db: Session):
    end_of_life_alerts = []
    products = db.query(Product).all()
    for product in products:
        if product.expiration_date and (product.expiration_date - datetime.now().date()).days <= 90:
            message = f"ALERT: {product.name} is nearing end of life. Expiry Date: {product.expiration_date}"
            end_of_life_alerts.append(message)
            insert_alert(db, "near_end_of_life", message, product.id)
    return end_of_life_alerts

# Function to check products with sufficient stock
def check_sufficient_stock(db: Session):
    sufficient_stock_alerts = []
    products = db.query(Product).all()
    for product in products:
        if product.reorder_point <= product.stock_level <= product.max_stock:
            message = f"ALERT: {product.name} has sufficient stock. Stock Level: {product.stock_level}"
            sufficient_stock_alerts.append(message)
            insert_alert(db, "sufficient_stock", message, product.id)
    return sufficient_stock_alerts

# Function to check stocktaking requirement
def check_stocktaking(db: Session):
    stocktaking_alerts = []
    products = db.query(Product).all()
    current_date = datetime.now().date()  # Ensure current_date is a date object
    for product in products:
        if product.launch_date:  # Check if launch_date is not None
            # Ensure product.launch_date is a date object and compare it
            if (current_date - product.launch_date).days >= 180:
                message = f"Stocktaking required for Product: {product.name}"
                stocktaking_alerts.append(message)
                insert_alert(db, "stocktaking", message, product.id)
    return stocktaking_alerts


# Function to check for product recalls
def check_product_recall(db: Session):
    product_recall_alerts = []
    products = db.query(Product).all()
    for product in products:
        if 'Recall' in product.name:
            message = f"Product Recall Alert: {product.name} has been recalled."
            product_recall_alerts.append(message)
            insert_alert(db, "product_recall", message, product.id)
    return product_recall_alerts

# Function to check sales alerts
def check_sales_alert(db: Session):
    alerts = []
    sales_forecasts = db.query(SalesForecast).all()
    for forecast in sales_forecasts:
        product = forecast.product_location.product
        sales_deviation = abs(forecast.actual_sales - forecast.forecasted_sales)
        if sales_deviation > 10:  # Sales deviation threshold
            message = f"Sales deviation alert for product {product.name}. Deviation: {sales_deviation}"
            alerts.append(message)
            insert_alert(db, "sales", message, product.id)
    return alerts

# Function to run all alerts and store them in the database
def run_alerts():
    db = SessionLocal()
    check_overstock(db)
    check_low_stock(db)
    check_stock_shrinkage(db)
    check_near_expiration(db)
    check_near_end_of_life(db)
    check_sufficient_stock(db)
    check_stocktaking(db)
    check_product_recall(db)
    check_sales_alert(db)
    db.close()

# Scheduling the task to run every minute using APScheduler
def start_scheduler():
    scheduler = BackgroundScheduler()
    scheduler.add_job(run_alerts, 'interval', minutes=1)  # Run every minute
    scheduler.start()

if __name__ == "__main__":
    from apscheduler.events import EVENT_JOB_EXECUTED, EVENT_JOB_ERROR

    start_scheduler()
    
    # To ensure the program keeps running and scheduler keeps working
    try:
        while True:
            pass  # Keep the script running to allow the scheduler to run
    except (KeyboardInterrupt, SystemExit):
        pass  # Graceful exit
