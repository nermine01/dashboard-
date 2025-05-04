from datetime import datetime
from apscheduler.schedulers.background import BackgroundScheduler
from models import Product, ProductLocation, Alert, SalesForecast
from database import SessionLocal
from sqlalchemy.orm import Session
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
from pydantic import EmailStr
import threading
import asyncio
from models import Product, ProductLocation, Alert, SalesForecast, Transaction,Campaign,DeliverySchedule,OrderProposal,Supplier,Location
import time
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
from pydantic import BaseModel, EmailStr
import os
import pickle
from datetime import datetime, timedelta
from sqlalchemy import and_
from sqlalchemy.orm import Session
from collections import defaultdict

from models import Alert  # make sure Alert is imported
from database import SessionLocal  # if you're using SessionLocal
from fastapi_mail import FastMail, MessageSchema


##################################################################
# Email Config
conf = ConnectionConfig(
    MAIL_USERNAME="khalil.hannachi@retsci.com",
    MAIL_PASSWORD="cviw fyba eola itjv",
    MAIL_FROM="khalil.hannachi@retsci.com",
    MAIL_PORT=587,
    MAIL_SERVER="smtp.gmail.com",
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False,
    USE_CREDENTIALS=True,
    VALIDATE_CERTS=False
)
from collections import defaultdict

# Global timestamp tracker (reset on app restart)
last_email_sent_time = None

async def send_grouped_master_data_emails():
    global last_email_sent_time
    db: Session = SessionLocal()

    try:
        if last_email_sent_time is None:
            # First run: avoid sending all past alerts
            last_email_sent_time = datetime.utcnow() - timedelta(minutes=1)

        # Get new alerts since last email
        recent_alerts = db.query(Alert).filter(
            and_(
                Alert.alert_type == "master_data",
                Alert.timestamp > last_email_sent_time
            )
        ).all()

        if not recent_alerts:
            print("📭 No new master_data alerts to send.")
            return

        # Group alerts by Group2 name
        grouped_alerts = defaultdict(list)
        for alert in recent_alerts:
            try:
                group_name = alert.product.category.group3.group2.name
            except AttributeError:
                group_name = "Uncategorized"
            grouped_alerts[group_name].append(alert)

        # Send email per group
        fm = FastMail(conf)
        for group_name, alerts in grouped_alerts.items():
            body_lines = [
                f"[{a.timestamp.strftime('%Y-%m-%d %H:%M:%S')}] {a.message}"
                for a in alerts
            ]
            body = f"📢 Master Data Alerts for Group2: {group_name}\n\n" + "\n".join(body_lines)

            message_obj = MessageSchema(
                subject=f"Master Data Alerts - {group_name}",
                recipients=["nermine.haouala@gmail.com"],
                body=body,
                subtype="plain"
            )
            await fm.send_message(message_obj)

        print("✅ Master data alert emails sent.")
        last_email_sent_time = datetime.utcnow()  # ✅ update after sending

    except Exception as e:
        print(f"❌ Email sending error: {e}")
    finally:
        db.close()

###################################################################################



# Function to insert alerts into the database
def insert_alert(db: Session, alert_type: str, message: str, product_id: int = None):
    # Check if the alert already exists
    existing_alert = db.query(Alert).filter_by(
        alert_type=alert_type,
        message=message,
        product_id=product_id
    ).first()
    
    if existing_alert:
        print(f"🔁 Duplicate skipped: [{alert_type}] {message}")
        return None

    # Limit to max 20 alerts per alert_type
    existing_alerts_count = db.query(Alert).filter(Alert.alert_type == alert_type).count()
    if existing_alerts_count >= 20:
        print(f"🚫 Skipped: Max alert limit reached for type [{alert_type}]")
        return None

    alert = Alert(
        product_id=product_id,
        alert_type=alert_type,
        message=message,
        timestamp=datetime.utcnow()
    )
    db.add(alert)
    db.commit()
    db.refresh(alert)
    return alert



# Function to check overstock condition
def check_overstock(db: Session):
    print("Running check_overstock...")
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
        if product.recall_status:  # Use recall_status boolean field instead of name check
            message = f"Product Recall Alert: {product.name} at {product_location.location.name} has been recalled."
            product_recall_alerts.append(message)
            insert_alert(db, "product_recall", message, product.id)
    return product_recall_alerts


# Function to check SKU Velocity Alert
def check_sku_velocity_alert(db: Session):
    sku_velocity_alerts = []
    transactions = db.query(Transaction).all()
    
    product_sales = {}
    
    # Aggregate total sold quantity and count of days
    for transaction in transactions:
        if transaction.product_location_id not in product_sales:
            product_sales[transaction.product_location_id] = {
                'total_sold': 0,
                'days_count': 0
            }
        product_sales[transaction.product_location_id]['total_sold'] += transaction.sold_quantity
        product_sales[transaction.product_location_id]['days_count'] += 1

    for product_location_id, sales_data in product_sales.items():
        avg_sales_per_day = sales_data['total_sold'] / sales_data['days_count'] if sales_data['days_count'] else 0

        # Fetch the corresponding forecast if it exists
        forecast = db.query(SalesForecast).filter(
            SalesForecast.product_location_id == product_location_id
        ).order_by(SalesForecast.date.desc()).first()

        if forecast:
            expected_sales_per_day = forecast.forecasted_sales / 30 if forecast.forecasted_sales else 0  # assume monthly forecast
            
            if expected_sales_per_day > 0:
                deviation_percentage = ((avg_sales_per_day - expected_sales_per_day) / expected_sales_per_day) * 100

                # Trigger alert if deviation is greater than 20% up or down
                if abs(deviation_percentage) > 20:
                    product = forecast.product_location.product
                    location = forecast.product_location.location
                    message = (
                        f"SKU Velocity Alert: {product.name} at {location.name} has a sales rate change of {deviation_percentage:.2f}% "
                        f"(Avg Sales/Day: {avg_sales_per_day:.2f}, Expected: {expected_sales_per_day:.2f})"
                    )
                    sku_velocity_alerts.append(message)
                    insert_alert(db, "sku_velocity", message, product.id)

    return sku_velocity_alerts


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


def check_under_forecasting(db: Session):
    alerts = []
    forecasts = db.query(SalesForecast).all()

    for forecast in forecasts:
        if forecast.actual_sales > forecast.forecasted_sales * 1.2:  # 20% threshold
            product = forecast.product_location.product
            location = forecast.product_location.location
            message = (
                f"Forecast Underestimation Alert: {product.name} at {location.name} has higher actual sales "
                f"than forecasted. Actual: {forecast.actual_sales}, Forecast: {forecast.forecasted_sales}"
            )
            alerts.append(message)
            insert_alert(db, "forecast_under", message, product.id)
    
    return alerts

def check_promotion_incoming(db: Session):
    promotion_alerts = []
    current_date = datetime.now().date()
    promotions = db.query(Campaign).all()

    for promo in promotions:
        if promo.promotion_start_date and (0 <= (promo.promotion_start_date - current_date).days <= 7):
            message = f"Promotion Incoming Alert: A promotion is starting soon on {promo.promotion_start_date}. Update forecasts accordingly."
            promotion_alerts.append(message)
            insert_alert(db, "promotion_incoming", message)
    
    return promotion_alerts

def check_new_product_launch(db: Session):
    launch_alerts = []
    current_date = datetime.now().date()
    products = db.query(Product).all()

    for product in products:
        if product.launch_date and (0 <= (current_date - product.launch_date).days <= 30):
            message = f"New Product Launch Alert: {product.name} launched recently on {product.launch_date}. Update forecasts and replenishment."
            launch_alerts.append(message)
            insert_alert(db, "new_product_launch", message, product.id)
    
    return launch_alerts

def check_seasonal_forecast_issue(db: Session):
    seasonal_alerts = []
    forecasts = db.query(SalesForecast).all()

    for forecast in forecasts:
        if forecast.seasonal_deviation_threshold and abs(forecast.actual_sales - forecast.forecasted_sales) > forecast.seasonal_deviation_threshold:
            product = forecast.product_location.product
            location = forecast.product_location.location
            message = (
                f"Seasonal Forecast Issue: {product.name} at {location.name} deviated from expected seasonal trend."
            )
            seasonal_alerts.append(message)
            insert_alert(db, "seasonal_forecast_issue", message, product.id)
    
    return seasonal_alerts

def check_year_over_year_deviation(db: Session):
    yoy_alerts = []
    forecasts = db.query(SalesForecast).all()

    for forecast in forecasts:
        if forecast.sales_last_year:
            deviation = ((forecast.actual_sales - forecast.sales_last_year) / forecast.sales_last_year) * 100
            if abs(deviation) > 20:  # 20% deviation threshold
                product = forecast.product_location.product
                location = forecast.product_location.location
                message = (
                    f"Y-O-Y Deviation Alert: {product.name} at {location.name} shows {deviation:.2f}% deviation from last year's sales."
                )
                yoy_alerts.append(message)
                insert_alert(db, "yoy_deviation", message, product.id)
    
    return yoy_alerts

#Replenishment-Related Alerts

def check_delay_issue(db: Session):
    delay_alerts = []
    deliveries = db.query(DeliverySchedule).all()
    current_date = datetime.now().date()

    for delivery in deliveries:
        if delivery.expected_delivery_date and delivery.expected_delivery_date < current_date and delivery.delivery_status != "Delivered":
            product = delivery.product_location.product
            location = delivery.product_location.location
            message = f"Delay Issue: Delivery for {product.name} at {location.name} is delayed."
            delay_alerts.append(message)
            insert_alert(db, "delay_issue", message, product.id)
    
    return delay_alerts

def check_damaged_goods(db: Session):
    damage_alerts = []
    transactions = db.query(Transaction).all()

    for transaction in transactions:
        if transaction.damaged_quantity and transaction.damaged_quantity > 0:
            product = transaction.product_location.product
            location = transaction.product_location.location
            message = f"Damaged Goods Alert: {transaction.damaged_quantity} units of {product.name} at {location.name} damaged."
            damage_alerts.append(message)
            insert_alert(db, "damaged_goods", message, product.id)
    
    return damage_alerts

def check_order_mismatch(db: Session):
    mismatch_alerts = []
    orders = db.query(OrderProposal).all()

    for order in orders:
        if order.expected_quantity and order.received_quantity and abs(order.expected_quantity - order.received_quantity) > order.mismatch_tolerance:
            product = order.product_location.product
            location = order.product_location.location
            message = f"Order Mismatch Alert: {product.name} at {location.name} received {order.received_quantity} instead of {order.expected_quantity}."
            mismatch_alerts.append(message)
            insert_alert(db, "order_mismatch", message, product.id)
    
    return mismatch_alerts


def check_quality_issue(db: Session):
    quality_alerts = []
    deliveries = db.query(DeliverySchedule).all()

    for delivery in deliveries:
        if delivery.delivery_status and delivery.delivery_status == "Rejected":
            product = delivery.product_location.product
            location = delivery.product_location.location
            message = f"Quality Issue Alert: Delivery for {product.name} at {location.name} rejected due to quality issues."
            quality_alerts.append(message)
            insert_alert(db, "quality_issue", message, product.id)
    
    return quality_alerts


def check_discontinued_product(db: Session):
    discontinued_alerts = []
    products = db.query(Product).all()

    for product in products:
        if product.lifecycle_status == "Discontinued":
            message = f"Discontinued Product Alert: {product.name} is no longer available for replenishment."
            discontinued_alerts.append(message)
            insert_alert(db, "discontinued_product", message, product.id)
    
    return discontinued_alerts

def check_order_cancelled(db: Session):
    cancelled_alerts = []
    orders = db.query(OrderProposal).all()

    for order in orders:
        if order.status and order.status.lower() == "cancelled":
            product = order.product_location.product
            location = order.product_location.location
            message = f"Order Cancelled Alert: Order for {product.name} at {location.name} was cancelled."
            cancelled_alerts.append(message)
            insert_alert(db, "order_cancelled", message, product.id)
    
    return cancelled_alerts

def check_lead_time_change(db: Session):
    lead_time_alerts = []
    orders = db.query(OrderProposal).all()

    for order in orders:
        if order.expected_lead_time and (order.received_date and order.order_date):
            actual_lead_time = (order.received_date - order.order_date).days
            if abs(order.expected_lead_time - actual_lead_time) > 5:  # more than 5 days difference
                product = order.product_location.product
                location = order.product_location.location
                message = (
                    f"Lead Time Alert: {product.name} at {location.name} lead time deviation. "
                    f"Expected: {order.expected_lead_time} days, Actual: {actual_lead_time} days."
                )
                lead_time_alerts.append(message)
                insert_alert(db, "lead_time_change", message, product.id)
    
    return lead_time_alerts

def check_supplier_issues(db: Session):
    supplier_alerts = []
    suppliers = db.query(Supplier).all()

    for supplier in suppliers:
        if supplier.performance_score and supplier.performance_score < 70:
            message = f"Supplier Alert: {supplier.name} performance score is low ({supplier.performance_score})."
            created = create_alert_if_not_exists(
                db,
                message=message,
                alert_type="supplier_alert",  # 🔁 corrected here
                product_id=None
            )
            if created:
                supplier_alerts.append(message)

    return supplier_alerts



def check_supplier_performance(db: Session):
    performance_alerts = []
    suppliers = db.query(Supplier).all()

    for supplier in suppliers:
        if supplier.on_time_delivery_rate and supplier.on_time_delivery_rate < 80:
            message = f"Supplier Performance Alert: {supplier.name} has low on-time delivery rate ({supplier.on_time_delivery_rate}%)."
            performance_alerts.append(message)
            insert_alert(db, "supplier_performance", message)
    
    return performance_alerts

def check_supplier_contract_expiration(db: Session):
    expiration_alerts = []
    suppliers = db.query(Supplier).all()
    current_date = datetime.now().date()

    for supplier in suppliers:
        if supplier.contract_end_date and (0 <= (supplier.contract_end_date - current_date).days <= 30):
            message = f"Supplier Contract Expiration Alert: {supplier.name}'s contract ends on {supplier.contract_end_date}."
            expiration_alerts.append(message)
            insert_alert(db, "supplier_contract_expiration", message)
    
    return expiration_alerts

def check_supplier_capacity(db: Session):
    capacity_alerts = []
    suppliers = db.query(Supplier).all()

    for supplier in suppliers:
        if supplier.current_capacity and supplier.min_capacity_threshold and supplier.current_capacity < supplier.min_capacity_threshold:
            message = f"Supplier Capacity Alert: {supplier.name} capacity below minimum threshold."
            capacity_alerts.append(message)
            insert_alert(db, "supplier_capacity", message)
    
    return capacity_alerts


def check_warehouse_capacity(db: Session):
    warehouse_alerts = []
    locations = db.query(Location).all()

    for location in locations:
        if location.current_stock_level and location.max_capacity and location.current_stock_level >= location.max_capacity * 0.9:
            message = f"Warehouse Capacity Alert: {location.name} nearing full capacity."
            warehouse_alerts.append(message)
            insert_alert(db, "warehouse_capacity", message)
    
    return warehouse_alerts


def check_missing_data(db: Session):
    missing_data_alerts = []
    products = db.query(Product).all()

    for product in products:
        missing_fields = []
        
        if not product.name:
            missing_fields.append("Name")
        if not product.launch_date:
            missing_fields.append("Launch Date")
        if not product.expiration_date:
            missing_fields.append("Expiration Date")
        if not product.lifecycle_status:
            missing_fields.append("Lifecycle Status")

        if missing_fields:
            fields_str = ", ".join(missing_fields)
            message = f"Missing Data: Product '{product.name if product.name else 'Unnamed'}' is missing fields: {fields_str}."
            missing_data_alerts.append(message)
            insert_alert(db, "master_data", message, product.id if product.id else None)
    
    return missing_data_alerts

def check_incorrect_input(db: Session):
    incorrect_input_alerts = []
    products = db.query(Product).all()

    for product in products:
        if product.launch_date and product.expiration_date:
            if product.launch_date > product.expiration_date:
                message = f"Incorrect Input: Product '{product.name}' has launch date ({product.launch_date}) after expiration date ({product.expiration_date})."
                incorrect_input_alerts.append(message)
                insert_alert(db, "master_data", message, product.id if product.id else None)
    
    return incorrect_input_alerts

def check_return_alerts(db: Session):
    return_alerts = []
    products = db.query(Product).all()

    for product in products:
        if hasattr(product, 'is_returned') and product.is_returned:
            message = f"Return Alert: Product '{product.name}' was returned by a customer."
            return_alerts.append(message)
            insert_alert(db, "master_data", message, product.id if product.id else None)
    
    return return_alerts

# Function to run all alerts
def run_alerts():
    from models import Alert
    db = SessionLocal()

    alert_functions = [
        check_missing_data,
        check_incorrect_input,
        check_return_alerts,
        check_overstock,
        check_low_stock,
        check_stock_shrinkage,
        check_near_expiration,
        check_near_end_of_life,
        check_sufficient_stock,
        check_stocktaking,
        check_product_recall,
        check_sales_alert,
        check_over_forecasting,
        check_sku_velocity_alert,
        check_under_forecasting,
        check_new_product_launch,
        check_seasonal_forecast_issue,
        check_year_over_year_deviation,
        check_delay_issue,
        check_damaged_goods,
        check_order_mismatch,
        check_quality_issue,
        check_discontinued_product,
        check_order_cancelled,
        check_lead_time_change,
        check_supplier_issues,
        check_supplier_performance,
        check_supplier_contract_expiration,
        check_supplier_capacity,
        check_warehouse_capacity,
        check_promotion_incoming,
    ]

    print("🔍 Running all alert checks...")
    total_new_alerts = 0

    for func in alert_functions:
        try:
            print(f"\n--- Executing: {func.__name__} ---")
            before_count = db.query(Alert).count()
            func(db)
            after_count = db.query(Alert).count()
            new_alerts = after_count - before_count

            if new_alerts > 0:
                print(f"✅ {new_alerts} new alert(s) added by {func.__name__}")
                total_new_alerts += new_alerts
            else:
                print(f"ℹ️ No alerts to be added by {func.__name__}")
        except Exception as e:
            print(f"[ERROR] {func.__name__} failed: {e}")

    print("\n🎯 Alert summary:")
    if total_new_alerts > 0:
        print(f"✅ Total new alerts added: {total_new_alerts}")
    else:
        print("ℹ️ No alerts to be added at this time.")

    db.close()


    
################################################################alerts integrated to main
# Scheduling the task to run every minute
def get_last_run_time():
    try:
        with open('last_run_time.pkl', 'rb') as f:
            return pickle.load(f)
    except FileNotFoundError:
        return None
    
def start_scheduler():
    from apscheduler.schedulers.background import BackgroundScheduler
    import time

    scheduler = BackgroundScheduler()

    # Schedule run_alerts to run every hour (3600 seconds)
    scheduler.add_job(run_alerts, 'interval', minutes=1)
    
    # Start the scheduler
    scheduler.start()
    print("Scheduler started...")

    try:
        while True:
            time.sleep(10)  # sleep 10 seconds to keep the script running
    except (KeyboardInterrupt, SystemExit):
        pass
def create_alert_if_not_exists(db, message, alert_type, product_id=None):
    from models import Alert

    query = db.query(Alert).filter_by(
        message=message,
        alert_type=alert_type,
        product_id=product_id
    )

    if query.first():
        print(f"🔁 Duplicate skipped: [{alert_type}] {message}")
        return False

    new_alert = Alert(
        message=message,
        alert_type=alert_type,
        product_id=product_id,
        timestamp=datetime.utcnow()
    )
    db.add(new_alert)
    db.commit()
    print(f"✅ New alert created: [{alert_type}] {message}")
    return True



def update_last_run_time():
    with open('last_run_time.pkl', 'wb') as f:
        pickle.dump(datetime.now(), f)
# Modify alert checking to only fetch new alerts based on the last run time
def check_new_alerts(db: Session, last_run_time):
    new_alerts = []

    # Check alerts based on creation time
    alerts = db.query(Alert).filter(Alert.created_at > last_run_time).all()  # Only check for new alerts

    for alert in alerts:
        message = f"New Alert: {alert.alert_type} - {alert.message}"
        new_alerts.append(message)
    
    return new_alerts

if __name__ == "__main__":
    start_scheduler()