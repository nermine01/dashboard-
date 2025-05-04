from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session, joinedload
import logging
import models, schemas, crud
from database import get_db
from schemas import ThresholdUpdate
from models import Product, ProductLocation
from apscheduler.schedulers.background import BackgroundScheduler
from alerts import run_alerts
import re
import asyncio
from alerts import send_grouped_master_data_emails

# Scheduler setup
scheduler = BackgroundScheduler()

def start_scheduler():
    if not scheduler.running:
        scheduler.add_job(run_alerts, 'interval', minutes=1)
        scheduler.start()
        print("Scheduler started with 60-minute interval...")
    else:
        print("Scheduler already running. Skipping start.")

# Initialize FastAPI app
app = FastAPI()

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def on_startup():
    print("📌 Running one-time alert check on startup...")
    await send_grouped_master_data_emails()  # immediate check
    print("✅ Initial alerts completed.")
    asyncio.create_task(run_alerts_loop())   # loop starts in background
    start_scheduler()


@app.on_event("shutdown")
async def on_shutdown():
    scheduler.shutdown()
    print("Scheduler stopped...")

@app.get("/alerts")
def get_all_alerts(db: Session = Depends(get_db)):
    alerts = (
        db.query(models.Alert)
        .options(
            joinedload(models.Alert.product)
            .joinedload(Product.product_locations)
            .joinedload(ProductLocation.location)
        )
        .all()
    )

    categorized_alerts = {}

    for alert in alerts:
        product = alert.product
        product_location = product.product_locations[0] if product and product.product_locations else None

        alert_data = {
            "id": alert.id,
            "message": alert.message,
            "timestamp": alert.timestamp.isoformat(),
            "product_id": alert.product_id,
            "productName": product.name if product else "Unknown",
            "currentStock": product_location.stock_level if product_location else 0,
            "threshold": product_location.reorder_point if product_location else 0,
            "location": product_location.location.name if product_location and product_location.location else "Unknown",
            "type": alert.alert_type,
            "title": alert.alert_type,
            "description": alert.message,
            "time": alert.timestamp.isoformat()
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

    pattern = re.compile(rf"\({label}:\s*\d+\)", re.IGNORECASE)
    new_segment = f"({label}: {int(update.threshold)})"

    if pattern.search(alert.message):
        alert.message = pattern.sub(new_segment, alert.message)
    else:
        raise HTTPException(status_code=400, detail=f"No matching '{label}' threshold found in message")

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
            continue

        group3 = group4.group3
        group2 = group3.group2 if group3 else None
        group1 = group2.group1 if group2 else None

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
async def run_alerts_loop():
    while True:
        try:
            print("🚀 Running alert checker")
            await send_grouped_master_data_emails()
        except Exception as e:
            print(f"❌ Error during alert loop: {e}")
        print("⏳ Sleeping for 1 hour..change to 3600.")
        await asyncio.sleep(60)


# Run app when executing the file directly
if __name__ == "__main__":
    import uvicorn
    logging.basicConfig(level=logging.DEBUG)
    logging.debug("Starting FastAPI app with debugging enabled...")
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True, log_level="debug")
