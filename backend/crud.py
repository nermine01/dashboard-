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

# Get Products by Location
def get_products_by_location(db: Session, location_id: int):
    return db.query(models.Product).join(models.ProductLocation).filter(models.ProductLocation.location_id == location_id).all()

# Get Products by Supplier
def get_products_by_supplier(db: Session, supplier_id: int):
    return db.query(models.Product).join(models.ProductLocation).filter(models.ProductLocation.supplier_id == supplier_id).all()

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

# Get All Alerts
def get_all_alerts(db: Session):
    db_alerts = db.query(models.Alert).all()  # Get all alerts from the Alert table
    return [schemas.AlertResponse.from_orm(alert) for alert in db_alerts]  # Convert each alert to Pydantic model

# Get All Locations
def get_locations(db: Session):
    return db.query(models.Location).all()

# Get Single Location by ID
def get_location_by_id(db: Session, location_id: int):
    return db.query(models.Location).filter(models.Location.id == location_id).first()

# Get Products by Location and Supplier
def get_products_by_location_and_supplier(db: Session, location_id: int, supplier_id: int):
    return db.query(models.Product).join(models.ProductLocation).filter(
        models.ProductLocation.location_id == location_id,
        models.ProductLocation.supplier_id == supplier_id
    ).all()

# Create ProductLocation
def create_product_location(db: Session, product_id: int, location_id: int, supplier_id: int, coordination_group_id: int):
    db_product_location = models.ProductLocation(
        product_id=product_id,
        location_id=location_id,
        supplier_id=supplier_id,
        coordination_group_id=coordination_group_id
    )
    db.add(db_product_location)
    db.commit()
    db.refresh(db_product_location)
    return db_product_location

