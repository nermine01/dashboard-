export const ALERT_TYPE_LABELS = {
  overstock: "Overstock",
  low_stock: "Low Stock",
  shrinkage: "Stock Shrinkage",
  near_expiration: "Near Expiration",
  near_end_of_life: "Near End of Life Period",
  sufficient_stock: "Sufficient Stock",
  stocktaking: "Stocktaking Alert",
  product_recall: "Product Recall Alert",
  sku_velocity: "SKU Velocity Alert",
  sales: "Sales Alert",
  forecast: "Over Forecasting",
  forecast_under: "Under Forecasting",
  promotion_incoming: "Promotion Incoming",
  new_product_launch: "New Product Launch",
  seasonal_forecast_issue: "Seasonal Forecast Issue",
  yoy_deviation: "Year-over-Year (Y-O-Y) Deviation",
  delay_issue: "Delay Issue",
  damaged_goods: "Damaged Goods",
  order_mismatch: "Mismatch",
  quality_issue: "Quality Issue",
  discontinued_product: "Discontinued Product",
  order_cancelled: "Order Cancelled",
  lead_time_change: "Lead Time Alert",
  supplier_alert: "Supplier Alert",
  supplier_performance: "Supplier Performance Alert",
  supplier_contract_expiration: "Supplier Contract Expiration",
  supplier_capacity: "Supplier Capacity Alert",
  warehouse_capacity: "Warehouse Capacity Alert",
  master_data: "Master Data Issue" || "Data Input",
};

export const CATEGORY_MAP = {
  overstock: { type: "info", tags: ["Inventory", "Overstock"] },
  low_stock: { type: "critical", tags: ["Inventory", "Low Stock"] },
  shrinkage: { type: "warning", tags: ["Inventory", "Shrinkage"] },
  near_expiration: { type: "warning", tags: ["Inventory", "Expiration"] },
  near_end_of_life: { type: "info", tags: ["Inventory", "Lifecycle"] },
  sufficient_stock: { type: "info", tags: ["Inventory", "Sufficient Stock"] },
  stocktaking: { type: "warning", tags: ["Inventory", "Stocktaking"] },
  product_recall: { type: "critical", tags: ["Recall", "Urgent"] },
  sku_velocity: { type: "warning", tags: ["Sales", "SKU Velocity"] },
  sales: { type: "warning", tags: ["Sales", "Deviation"] },

  forecast: { type: "warning", tags: ["Forecast", "Deviation"] },
  forecast_under: { type: "warning", tags: ["Forecast", "Under Forecasting"] },
  promotion_incoming: { type: "info", tags: ["Forecast", "Promotion Incoming"] },
  new_product_launch: { type: "info", tags: ["Forecast", "New Product"] },
  seasonal_forecast_issue: { type: "warning", tags: ["Forecast", "Seasonal Deviation"] },
  yoy_deviation: { type: "warning", tags: ["Forecast", "Year-over-Year Deviation"] },

  delay_issue: { type: "warning", tags: ["Replenishment", "Delay"] },
  damaged_goods: { type: "critical", tags: ["Replenishment", "Damaged Goods"] },
  order_mismatch: { type: "warning", tags: ["Replenishment", "Order Mismatch"] },
  quality_issue: { type: "critical", tags: ["Replenishment", "Quality Issue"] },
  discontinued_product: { type: "info", tags: ["Replenishment", "Discontinued"] },
  order_cancelled: { type: "warning", tags: ["Replenishment", "Order Cancelled"] },
  lead_time_change: { type: "warning", tags: ["Replenishment", "Lead Time Deviation"] },

  supplier_alert: { type: "warning", tags: ["Supplier", "Alert"] },
  supplier_performance: { type: "warning", tags: ["Supplier", "Performance"] },
  supplier_contract_expiration: { type: "warning", tags: ["Supplier", "Contract Expiration"] },
  supplier_capacity: { type: "warning", tags: ["Supplier", "Capacity"] },

  warehouse_capacity: { type: "warning", tags: ["Warehouse", "Capacity"] },

  master_data: { type: "warning", tags: ["Master Data", "Mismatch or Missing Fields"] },

  missing_data: { type: "warning", tags: ["Master Data", "Missing Data"] },
  incorrect_input: { type: "warning", tags: ["Master Data", "Incorrect Input"] },
};

export const getReadAlertsFromStorage = () => {
  const stored = localStorage.getItem("readAlerts");
  return stored ? JSON.parse(stored) : [];
};

export const saveReadAlertToStorage = (id) => {
  const readAlerts = getReadAlertsFromStorage();
  if (!readAlerts.includes(id)) {
    readAlerts.push(id);
    localStorage.setItem("readAlerts", JSON.stringify(readAlerts));
  }
};

export const getResolvedAlertsFromStorage = () => {
  const stored = localStorage.getItem("resolvedAlerts");
  return stored ? new Set(JSON.parse(stored)) : new Set();
};

export const saveResolvedAlertToStorage = (id) => {
  const resolvedAlerts = getResolvedAlertsFromStorage();
  if (!resolvedAlerts.has(id)) {
    resolvedAlerts.add(id);
    localStorage.setItem("resolvedAlerts", JSON.stringify(Array.from(resolvedAlerts)));
  }
};
export const removeResolvedAlertFromStorage = (id) => {
  const resolvedAlerts = getResolvedAlertsFromStorage();
  if (resolvedAlerts.has(id)) {
    resolvedAlerts.delete(id);
    localStorage.setItem("resolvedAlerts", JSON.stringify(Array.from(resolvedAlerts)));
  }
};
