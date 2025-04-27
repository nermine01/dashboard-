from datetime import datetime
from apscheduler.schedulers.background import BackgroundScheduler
from models import Product, ProductLocation, Alert, SalesForecast
from database import SessionLocal
from sqlalchemy.orm import Session

# Function to insert alerts into the database
def insert_alert(db: Session, alert_type: str, message: str, product_id: int = None):
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
    product_locations = db.query(ProductLocation).all()
    for product_location in product_locations:
        product = product_location.product
        if product_location.stock_level > product_location.max_stock:
            message = f"ALERT: {product.name} at {product_location.location.name} is overstocked. Stock: {product_location.stock_level} (Max: {product_location.max_stock})"
            overstock_alerts.append(message)
            insert_alert(db, "overstock", message, product.id)
    return overstock_alerts

# Function to check low stock condition
def check_low_stock(db: Session):
    low_stock_alerts = []
    product_locations = db.query(ProductLocation).all()
    for product_location in product_locations:
        product = product_location.product
        if product_location.stock_level < product_location.reorder_point:
            message = f"ALERT: {product.name} at {product_location.location.name} has low stock. Stock: {product_location.stock_level} (Reorder Point: {product_location.reorder_point})"
            low_stock_alerts.append(message)
            insert_alert(db, "low_stock", message, product.id)
    return low_stock_alerts

# Function to check stock shrinkage
def check_stock_shrinkage(db: Session):
    shrinkage_alerts = []
    product_locations = db.query(ProductLocation).all()
    for product_location in product_locations:
        product = product_location.product
        ideal_stock_level = product_location.max_stock
        if product_location.stock_level < ideal_stock_level * 0.90:
            message = f"ALERT: Possible shrinkage detected in {product.name} at {product_location.location.name}. Stock: {product_location.stock_level} (Ideal: {ideal_stock_level})"
            shrinkage_alerts.append(message)
            insert_alert(db, "shrinkage", message, product.id)
    return shrinkage_alerts

# Function to check products near expiration
def check_near_expiration(db: Session):
    near_expiration_alerts = []
    product_locations = db.query(ProductLocation).all()
    current_date = datetime.now().date()
    for product_location in product_locations:
        product = product_location.product
        if product.expiration_date and (product.expiration_date - current_date).days <= 30:
            message = f"ALERT: {product.name} at {product_location.location.name} is near expiration. Expiry Date: {product.expiration_date}"
            near_expiration_alerts.append(message)
            insert_alert(db, "near_expiration", message, product.id)
    return near_expiration_alerts

# Function to check products near end of life
def check_near_end_of_life(db: Session):
    end_of_life_alerts = []
    product_locations = db.query(ProductLocation).all()
    for product_location in product_locations:
        product = product_location.product
        if product.expiration_date and (product.expiration_date - datetime.now().date()).days <= 90:
            message = f"ALERT: {product.name} at {product_location.location.name} is nearing end of life. Expiry Date: {product.expiration_date}"
            end_of_life_alerts.append(message)
            insert_alert(db, "near_end_of_life", message, product.id)
    return end_of_life_alerts

# Function to check products with sufficient stock
def check_sufficient_stock(db: Session):
    sufficient_stock_alerts = []
    product_locations = db.query(ProductLocation).all()
    for product_location in product_locations:
        product = product_location.product
        if product_location.reorder_point <= product_location.stock_level <= product_location.max_stock:
            message = f"ALERT: {product.name} at {product_location.location.name} has sufficient stock. Stock Level: {product_location.stock_level}"
            sufficient_stock_alerts.append(message)
            insert_alert(db, "sufficient_stock", message, product.id)
    return sufficient_stock_alerts

# Function to check stocktaking requirement
def check_stocktaking(db: Session):
    stocktaking_alerts = []
    product_locations = db.query(ProductLocation).all()
    current_date = datetime.now().date()
    for product_location in product_locations:
        product = product_location.product
        if product.launch_date and (current_date - product.launch_date).days >= 180:
            message = f"Stocktaking required for Product: {product.name} at {product_location.location.name}"
            stocktaking_alerts.append(message)
            insert_alert(db, "stocktaking", message, product.id)
    return stocktaking_alerts

# Function to check for product recalls
def check_product_recall(db: Session):
    product_recall_alerts = []
    product_locations = db.query(ProductLocation).all()
    for product_location in product_locations:
        product = product_location.product
        if 'Recall' in product.name:
            message = f"Product Recall Alert: {product.name} at {product_location.location.name} has been recalled."
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
        if sales_deviation > 10:
            message = f"Sales deviation alert for product {product.name} at {forecast.product_location.location.name}. Deviation: {sales_deviation}"
            alerts.append(message)
            insert_alert(db, "sales", message, product.id)
    return alerts

# Function to check over forecasting using BIAS
def check_over_forecasting(db: Session):
    over_forecast_alerts = []
    sales_forecasts = db.query(SalesForecast).all()
    for forecast in sales_forecasts:
        product_location = forecast.product_location
        product = product_location.product
        location = product_location.location
        bias = forecast.forecasted_sales - forecast.actual_sales
        if bias > 10:
            message = (
                f"Over Forecasting Alert: {product.name} at {location.name}. "
                f"BIAS: {bias} (Forecast: {forecast.forecasted_sales}, Actual: {forecast.actual_sales})"
            )
            over_forecast_alerts.append(message)
            insert_alert(db, "forecast", message, product.id)
    return over_forecast_alerts

# Function to check master data mismatch
def check_master_data_mismatch(db: Session):
    master_data_alerts = []
    products = db.query(Product).all()

    for product in products:
        # Missing Data
        if not product.name or not product.launch_date:
            message = f"Missing Data: Product '{product.name if product.name else 'Unnamed'}' is missing critical information."
            master_data_alerts.append(message)
            insert_alert(db, "master_data", message, product.id if product.id else None)

        # Incorrect Input
        if product.launch_date and product.expiration_date:
            if product.launch_date > product.expiration_date:
                message = f"Incorrect Input: Product '{product.name}' has launch date after expiration date."
                master_data_alerts.append(message)
                insert_alert(db, "master_data", message, product.id if product.id else None)

        # Return Alert
        if hasattr(product, 'is_returned') and product.is_returned:
            message = f"Return Alert: Product '{product.name}' was returned by a customer."
            master_data_alerts.append(message)
            insert_alert(db, "master_data", message, product.id if product.id else None)

    for alert in master_data_alerts:
        print(alert)

    return master_data_alerts

# Function to run all alerts
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
    check_over_forecasting(db)
    check_master_data_mismatch(db)
    db.close()

# Scheduling the task to run every minute
def start_scheduler():
    scheduler = BackgroundScheduler()
    scheduler.add_job(run_alerts, 'interval', minutes=1)
    scheduler.start()

if __name__ == "__main__":
    start_scheduler()
    try:
        while True:
            pass
    except (KeyboardInterrupt, SystemExit):
        pass
