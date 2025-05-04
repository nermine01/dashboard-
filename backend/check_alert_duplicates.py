from database import SessionLocal
from models import Alert
from sqlalchemy.orm import Session
from collections import defaultdict
from datetime import datetime

def check_alert_duplicates(db: Session):
    # Query all alerts
    alerts = db.query(Alert).all()

    # Dictionary to count duplicates by (alert_type, message, product_id)
    alert_counts = defaultdict(int)

    for alert in alerts:
        key = (alert.alert_type, alert.message, alert.product_id)
        alert_counts[key] += 1

    duplicates = {key: count for key, count in alert_counts.items() if count > 1}

    if duplicates:
        print("Duplicate alerts found:")
        for (alert_type, message, product_id), count in duplicates.items():
            print(f"Alert Type: {alert_type}, Product ID: {product_id}, Count: {count}")
            print(f"Message: {message}")
            print("-----")
    else:
        print("No duplicate alerts found.")

if __name__ == "__main__":
    db = SessionLocal()
    check_alert_duplicates(db)
    db.close()
