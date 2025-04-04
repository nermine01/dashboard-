from sqlalchemy import Column, Integer, String, Float, Date, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from database import Base  # Import your SQLAlchemy Base class
import datetime
from pydantic import BaseModel, field_serializer
from datetime import date
from typing import Optional, List
from pydantic import BaseModel
from typing import Optional
from datetime import date
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
from datetime import datetime

# Product Model (previously Product)
class Product(Base):
    __tablename__ = "Product"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)  # Changed from 'name' to match 'product_name'
    category_id = Column(Integer, ForeignKey("groups_4.id"))
    expiration_date = Column(Date)
    end_of_life_date = Column(Date)
    lifecycle_status = Column(String(50))
    recall_status = Column(Boolean)
    launch_date = Column(Date)
    stock_level = Column(Integer, default=0)  # Added for stock tracking
    reorder_point = Column(Integer, nullable=False)  # Added for reorder threshold
    max_stock = Column(Integer, nullable=False)  # Added for max stock
    
    category = relationship("Group4", back_populates="products")
    alerts = relationship("Alert", back_populates="Product")


# Group Models (categories)
class Group4(Base):
    __tablename__ = "groups_4"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    parent_id = Column(Integer, ForeignKey("groups_4.id"))
    
    parent = relationship("Group4", remote_side=[id])
    products = relationship("Product", back_populates="category")  # Changed to Product from Product

class Group3(Base):
    __tablename__ = "groups_3"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    parent_id = Column(Integer, ForeignKey("groups_4.id"))

    parent = relationship("Group4", backref="groups_3")


class Group2(Base):
    __tablename__ = "groups_2"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    parent_id = Column(Integer, ForeignKey("groups_3.id"))

    parent = relationship("Group3", backref="groups_2")


class Group1(Base):
    __tablename__ = "groups_1"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    parent_id = Column(Integer, ForeignKey("groups_2.id"))

    parent = relationship("Group2", backref="groups_1")


# Locations Model
class Location(Base):
    __tablename__ = "locations"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255))
    chain_id = Column(Integer, ForeignKey("chains.id"))
    current_stock_level = Column(Integer)
    max_capacity = Column(Integer)
    warehouse_threshold = Column(Float)

    chain = relationship("Chain")


# Chains Model
class Chain(Base):
    __tablename__ = "chains"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255))
    country_id = Column(Integer, ForeignKey("countries.id"))

    country = relationship("Country")


# Countries Model
class Country(Base):
    __tablename__ = "countries"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255))


# Suppliers Model
class Supplier(Base):
    __tablename__ = "suppliers"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255))
    performance_score = Column(Float)
    on_time_delivery_rate = Column(Float)
    quality_rating = Column(Float)
    contract_end_date = Column(Date)
    current_capacity = Column(Integer)
    min_capacity_threshold = Column(Integer)


# Product Location Model
class ProductLocation(Base):
    __tablename__ = "product_location"
    
    id = Column(Integer, primary_key=True, index=True)
    Product_id = Column(Integer, ForeignKey("Product.id"))
    location_id = Column(Integer, ForeignKey("locations.id"))
    supplier_id = Column(Integer, ForeignKey("suppliers.id"))
    coordination_group_id = Column(Integer)

    Product = relationship("Product")
    location = relationship("Location")
    supplier = relationship("Supplier")


# Product Location Campaign Model
class ProductLocationCampaign(Base):
    __tablename__ = "product_location_campaign"
    
    id = Column(Integer, primary_key=True, index=True)
    product_location_id = Column(Integer, ForeignKey("product_location.id"))
    campaign_id = Column(Integer, ForeignKey("campaigns.id"))

    product_location = relationship("ProductLocation")


# Location Supplier Model
class LocationSupplier(Base):
    __tablename__ = "location_supplier"
    
    id = Column(Integer, primary_key=True, index=True)
    location_id = Column(Integer, ForeignKey("locations.id"))
    supplier_id = Column(Integer, ForeignKey("suppliers.id"))


# Delivery Schedule Model
class DeliverySchedule(Base):
    __tablename__ = "delivery_schedule"
    
    id = Column(Integer, primary_key=True, index=True)
    product_location_id = Column(Integer, ForeignKey("product_location.id"))
    expected_delivery_date = Column(Date)
    actual_delivery_date = Column(Date)
    expected_quantity = Column(Integer)
    received_quantity = Column(Integer)
    delivery_status = Column(String(50))

    product_location = relationship("ProductLocation")


# Transactions Model
class Transaction(Base):
    __tablename__ = "transactions"
    
    id = Column(Integer, primary_key=True, index=True)
    product_location_id = Column(Integer, ForeignKey("product_location.id"))
    date = Column(Date)
    sold_quantity = Column(Integer)
    recorded_stock = Column(Integer)
    damaged_quantity = Column(Integer)
    received_quantity = Column(Integer)
    returned_quantity = Column(Integer)

    product_location = relationship("ProductLocation")


# Sales Forecast Model
class SalesForecast(Base):
    __tablename__ = "sales_forecasts"
    
    id = Column(Integer, primary_key=True, index=True)
    product_location_id = Column(Integer, ForeignKey("product_location.id"))
    date = Column(Date)
    forecasted_sales = Column(Integer)
    actual_sales = Column(Integer)
    sales_last_year = Column(Integer)
    seasonal_deviation_threshold = Column(Float)

    product_location = relationship("ProductLocation")


# Order Proposals Model
class OrderProposal(Base):
    __tablename__ = "order_proposals"
    
    id = Column(Integer, primary_key=True, index=True)
    product_location_id = Column(Integer, ForeignKey("product_location.id"))
    date = Column(Date)
    expected_quantity = Column(Integer)
    received_quantity = Column(Integer)
    order_date = Column(Date)
    received_date = Column(Date)
    expected_lead_time = Column(Integer)
    mismatch_tolerance = Column(Float)
    status = Column(String(50))

    product_location = relationship("ProductLocation")


# Campaigns Model
class Campaign(Base):
    __tablename__ = "campaigns"
    
    id = Column(Integer, primary_key=True, index=True)
    promotion_start_date = Column(Date)




# Alert Model
class Alert(Base):
    __tablename__ = "alerts"
    
    id = Column(Integer, primary_key=True, index=True)
    Product_id = Column(Integer, ForeignKey("Product.id"))
    alert_type = Column(String, nullable=False)
    message = Column(String, nullable=False)
    timestamp = Column(DateTime, default=func.now())  # Corrected this line
    Product = relationship("Product", back_populates="alerts")




# Product Schema for Creation (Request Body)
class ProductCreate(BaseModel):
    name: str
    category_id: int
    expiration_date: Optional[date] = None
    end_of_life_date: Optional[date] = None
    lifecycle_status: str
    recall_status: bool
    launch_date: date
    stock_level: int
    reorder_point: int
    max_stock: int

    class Config:
        from_attributes = True  # Use 'from_attributes' for compatibility with SQLAlchemy models

# Product Schema for Response (Output Body)
class ProductResponse(BaseModel):
    id: int
    name: str
    category_id: int
    expiration_date: Optional[date] = None
    end_of_life_date: Optional[date] = None
    lifecycle_status: str
    recall_status: bool
    launch_date: date
    stock_level: int
    reorder_point: int
    max_stock: int

    class Config:
        from_attributes = True  # Use 'from_attributes' for compatibility with SQLAlchemy models


# For single alert response
class AlertBase(BaseModel):
    product_id: int
    alert_type: str
    message: str
    timestamp: Optional[datetime] = None

    class Config:
        orm_mode = True  # Enable ORM mode for SQLAlchemy support
        arbitrary_types_allowed = True  # Allow arbitrary types like SQLAlchemy models

# For multiple alerts response
class AlertsResponse(BaseModel):
    alerts: List[AlertBase]  # A list of AlertBase models

    class Config:
        orm_mode = True  # Enable ORM mode for this as well
        arbitrary_types_allowed = True  # Allow arbitrary types for lists as well


class ProductBase(BaseModel):
    name: str
    category_id: int
    expiration_date: Optional[date]  # Optional to handle null values
    end_of_life_date: Optional[date]
    lifecycle_status: Optional[str]
    recall_status: Optional[bool]
    launch_date: Optional[date]
    stock_level: int
    reorder_point: int
    max_stock: int

    class Config:
        from_attributes = True  # Enable compatibility with SQLAlchemy models

    # Serializer to convert date to ISO 8601 string format
    @field_serializer('expiration_date', 'end_of_life_date', 'launch_date')
    def serialize_date(self, v: Optional[date]) -> Optional[str]:
        if isinstance(v, date):
            return v.isoformat()  # Convert date to string in 'YYYY-MM-DD' format
        return v


class ProductResponse(ProductBase):
    id: int

    class Config:
        from_attributes = True  # Enable compatibility with SQLAlchemy models

