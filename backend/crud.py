from sqlalchemy.orm import Session
import models, schemas

# Create Product
def create_product(db: Session, product: schemas.ProductCreate):
    db_product = models.Product(**product.dict())  # Convert Pydantic model to SQLAlchemy model
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product  # This will be converted to Pydantic model in the response

# Get All Products
def get_products(db: Session):
    return db.query(models.Product).all()

# Get Single Product by ID
def get_product_by_id(db: Session, product_id: int):
    return db.query(models.Product).filter(models.Product.id == product_id).first()

# Create Alert
def create_alert(db: Session, alert: schemas.AlertBase):
    db_alert = models.Alert(**alert.model_dump())
    db.add(db_alert)
    db.commit()
    db.refresh(db_alert)
    return db_alert

# Get Alerts for a Specific Product
def get_alerts_by_product(db: Session, product_id: int):
    return db.query(models.Alert).filter(models.Alert.product_id == product_id).all()
# Get  All Alerts
def get_all_alerts(db: Session):
    db_alerts = db.query(models.Alert).all()  # Get all alerts from the Alert table
    return [schemas.AlertResponse.from_orm(alert) for alert in db_alerts]  # Convert each alert to Pydantic model
