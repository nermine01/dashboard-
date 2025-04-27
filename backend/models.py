from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Column, Integer, String, Float, DateTime, Date, Boolean, ForeignKey
from sqlalchemy.orm import relationship
import datetime

# Declare Base here
Base = declarative_base()

# Group Models (Category hierarchy)
class Group1(Base):
    __tablename__ = "groups_1"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)

    groups_2 = relationship("Group2", back_populates="group1")


class Group2(Base):
    __tablename__ = "groups_2"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    parent_id = Column(Integer, ForeignKey("groups_1.id"))

    group1 = relationship("Group1", back_populates="groups_2")
    groups_3 = relationship("Group3", back_populates="group2")


class Group3(Base):
    __tablename__ = "groups_3"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    parent_id = Column(Integer, ForeignKey("groups_2.id"))

    group2 = relationship("Group2", back_populates="groups_3")
    groups_4 = relationship("Group4", back_populates="group3")


class Group4(Base):
    __tablename__ = "groups_4"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    parent_id = Column(Integer, ForeignKey("groups_3.id"))

    group3 = relationship("Group3", back_populates="groups_4")
    products = relationship("Product", back_populates="category")


# Product Model
class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    category_id = Column(Integer, ForeignKey("groups_4.id"))
    expiration_date = Column(Date)
    end_of_life_date = Column(Date)
    lifecycle_status = Column(String(50))
    recall_status = Column(Boolean)
    launch_date = Column(Date)

    category = relationship("Group4", back_populates="products")
    alerts = relationship("Alert", back_populates="product")
    product_locations = relationship("ProductLocation", back_populates="product")


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
    product_id = Column(Integer, ForeignKey("products.id"))
    location_id = Column(Integer, ForeignKey("locations.id"))
    supplier_id = Column(Integer, ForeignKey("suppliers.id"))
    coordination_group_id = Column(Integer)

    stock_level = Column(Integer, default=0)
    reorder_point = Column(Integer, nullable=False)
    max_stock = Column(Integer, nullable=False)

    product = relationship("Product", back_populates="product_locations")
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
    product_id = Column(Integer, ForeignKey("products.id"))
    alert_type = Column(String, nullable=False)
    message = Column(String, nullable=False)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

    product = relationship("Product", back_populates="alerts")
