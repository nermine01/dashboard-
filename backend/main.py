from fastapi import FastAPI, Depends, HTTPException
from database import SessionLocal, engine, get_db
from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
import models, schemas, crud
from database import SessionLocal, engine
from fastapi.middleware.cors import CORSMiddleware

import logging
import pdb  # Python Debugger
from typing import List

from alerts import check_overstock, check_low_stock, check_stock_shrinkage, check_near_expiration, \
    check_near_end_of_life, check_sufficient_stock, check_stocktaking, check_product_recall, check_sales_alert
from fastapi.responses import JSONResponse

app = FastAPI()

# Add CORS middleware to allow requests from localhost:3000 (React frontend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React frontend URL
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],  # Allow all headers
)


# Example: Route to create a product
@app.post("/add-product/", response_model=schemas.ProductResponse)
def create_product(product: schemas.ProductCreate, db: Session = Depends(get_db)):
    db_product = crud.create_product(db=db, product=product)
    return db_product  # This will be automatically converted to Pydantic response model


# FastAPI route to get products
@app.get("/products/", response_model=List[schemas.ProductResponse])
def read_products(db: Session = Depends(get_db)):
    products = crud.get_products(db)
    return products



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


# Run the application through Python command (no need for command line uvicorn)
if __name__ == "__main__":
    import uvicorn
    # To use uvicorn to serve the app when running the script
    logging.basicConfig(level=logging.DEBUG)  # Setup logging to DEBUG level
    logging.debug("Starting FastAPI app with debugging enabled...")
    
    # Run the FastAPI app with debugging
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True, log_level="debug")