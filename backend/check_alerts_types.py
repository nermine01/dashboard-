from database import SessionLocal
from models import Alert
from sqlalchemy.orm import Session

# List of expected alert types based on alerts.py run_alerts function
EXPECTED_ALERT_TYPES = [
    "master_data",
    "overstock",
    "low_stock",
    "shrinkage",
    "near_expiration",
    "near_end_of_life",
    "sufficient_stock",
    "stocktaking",
    "product_recall",
    "sales",
    "forecast",
    "sku_velocity",
    "forecast_under",
    "promotion_incoming",
    "new_product_launch",
    "seasonal_forecast_issue",
    "yoy_deviation",
    "delay_issue",
    "damaged_goods",
    "order_mismatch",
    "quality_issue",
    "discontinued_product",
    "order_cancelled",
    "lead_time_change",
    "supplier_alert",
    "supplier_performance",
    "supplier_contract_expiration",
    "supplier_capacity",
    "warehouse_capacity"
]

def check_alert_types_in_db(db: Session):
    # Query distinct alert types present in the database
    alert_types_in_db = {alert.alert_type for alert in db.query(Alert).distinct(Alert.alert_type).all()}
    missing_alert_types = [alert_type for alert_type in EXPECTED_ALERT_TYPES if alert_type not in alert_types_in_db]

    if missing_alert_types:
        print("Missing alert types in the database:")
        for alert_type in missing_alert_types:
            print(f"- {alert_type}")
    else:
        print("All expected alert types are present in the database.")

if __name__ == "__main__":
    db = SessionLocal()
    check_alert_types_in_db(db)
    db.close()
