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

@app.get("/alerts")
def get_all_alerts(db: Session = Depends(get_db)):
    all_alerts = {
        "overstock": check_overstock(db),
        "low_stock": check_low_stock(db),
        "shrinkage": check_stock_shrinkage(db),
        "near_expiration": check_near_expiration(db),
        "near_end_of_life": check_near_end_of_life(db),
        "sufficient_stock": check_sufficient_stock(db),
        "stocktaking": check_stocktaking(db),
        "product_recall": check_product_recall(db),
        "sales": check_sales_alert(db)
    }
    return JSONResponse(content={"alerts": all_alerts})


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



# Run the application through Python command (no need for command line uvicorn)
if __name__ == "__main__":
    import uvicorn
    # To use uvicorn to serve the app when running the script
    logging.basicConfig(level=logging.DEBUG)  # Setup logging to DEBUG level
    logging.debug("Starting FastAPI app with debugging enabled...")
    
    # Run the FastAPI app with debugging
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True, log_level="debug")
