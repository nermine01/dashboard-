from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from typing import List
import re
import logging
import models, schemas, crud
from database import get_db
from schemas import ThresholdUpdate

from alerts import (
    check_overstock,
    check_low_stock,
    check_stock_shrinkage,
    check_near_expiration,
    check_near_end_of_life,
    check_sufficient_stock,
    check_stocktaking,
    check_product_recall,
    check_sales_alert
)

app = FastAPI()

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
from models import Alert
@app.get("/alerts")
def get_all_alerts(db: Session = Depends(get_db)):
    alerts = db.query(Alert).all()

    categorized_alerts = {}

    for alert in alerts:
        alert_data = {
            "id": alert.id,
            "message": alert.message,
            "timestamp": alert.timestamp.isoformat(),
            "product_id": alert.product_id
        }

        if alert.alert_type not in categorized_alerts:
            categorized_alerts[alert.alert_type] = []

        categorized_alerts[alert.alert_type].append(alert_data)

    return JSONResponse(content={"alerts": categorized_alerts})


@app.put("/alerts/{alert_id}/update-threshold")
def update_embedded_threshold(alert_id: int, update: ThresholdUpdate, db: Session = Depends(get_db)):
    alert = db.query(models.Alert).filter(models.Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")

    alert_type = alert.alert_type.lower()

    if "overstock" in alert_type:
        label = "Max"
    elif "understock" in alert_type or "low_stock" in alert_type or "low stock" in alert_type:
        label = "Reorder Point"
    else:
        raise HTTPException(status_code=400, detail="Unsupported alert type")

    pattern = rf"\({label}:\s*\d+\)"
    new_part = f"({label}: {int(update.threshold)})"

    new_message = re.sub(pattern, new_part, alert.message)
    if new_message == alert.message:
        raise HTTPException(status_code=400, detail=f"No matching {label} threshold found in message")

    alert.message = new_message
    db.commit()
    db.refresh(alert)
    return {"message": f"{label} threshold updated", "new_message": alert.message}

@app.get("/products/groups")
def get_product_groups(db: Session = Depends(get_db)):
    products = db.query(models.Product).all()
    results = []

    for product in products:
        group4 = product.category
        if not group4:
            continue  # Skip if no category

        group3 = group4.group3
        group2 = group3.group2 if group3 else None
        group1 = group2.group1 if group2 else None

        # Ensure all group levels exist before appending
        if not (group1 and group2 and group3):
            continue

        results.append({
            "product_id": product.id,
            "product_name": product.name,
            "group1": group1.name,
            "group2": group2.name,
            "group3": group3.name,
            "group4": group4.name
        })

    return results


# Run the application through Python command (no need for command line uvicorn)
if __name__ == "__main__":
    import uvicorn
    # To use uvicorn to serve the app when running the script
    logging.basicConfig(level=logging.DEBUG)  # Setup logging to DEBUG level
    logging.debug("Starting FastAPI app with debugging enabled...")
    
    # Run the FastAPI app with debugging
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True, log_level="debug")
