import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Header from "./components/ui/Header";
import AlertSummary from "./components/ui/AlertSummary";
import AlertFilters from "./components/ui/AlertFilters";
import AlertList from "./components/ui/AlertList";
import AlertDetails from "./pages/AlertDetails";

const ALERT_TYPE_LABELS = {
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
  master_data: "Master Data Issue",
  
};



const getReadAlertsFromStorage = () => {
  const stored = localStorage.getItem("readAlerts");
  return stored ? JSON.parse(stored) : [];
};

const saveReadAlertToStorage = (id) => {
  const readAlerts = getReadAlertsFromStorage();
  if (!readAlerts.includes(id)) {
    readAlerts.push(id);
    localStorage.setItem("readAlerts", JSON.stringify(readAlerts));
  }
};

const CATEGORY_MAP = {
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


function App() {
  const [activeTab, setActiveTab] = useState("All Alerts");
  const [alerts, setAlerts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [priorityFilter, setPriorityFilter] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState(null);
  const [typeFilter, setTypeFilter] = useState(null);
  const [locationFilter, setLocationFilter] = useState(null); // ✅ NEW

  useEffect(() => {
    fetch("http://localhost:8000/alerts")
      .then((res) => res.json())
      .then((data) => {
        const readAlerts = getReadAlertsFromStorage();
        const parsedAlerts = [];

        for (const categoryKey in data.alerts) {
          const categoryAlerts = data.alerts[categoryKey];

          categoryAlerts.forEach((alertObj) => {
            let typeLabel = "";
            if (categoryKey === "near_expiration") {
              typeLabel = "Near Expiration";
            } else if (categoryKey === "near_end_of_life") {
              typeLabel = "Near End of Life Period";
            } else if (categoryKey === "forecast") {
              const match = alertObj.message.match(/^(.*?) Alert:/i);
              typeLabel = match ? match[1].trim() : "Forecast Alert";
            } 
            else if (categoryKey === "master_data") {
              if (alertObj.message.toLowerCase().includes("missing data")) {
                typeLabel = "Missing Data";
              } else if (alertObj.message.toLowerCase().includes("incorrect input")) {
                typeLabel = "Incorrect Input";
              } else {
                typeLabel = "Master Data Issue"; // fallback
              } 
            }else {
              typeLabel =
                ALERT_TYPE_LABELS[categoryKey] ||
                categoryKey.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
            }

            const tags = [
              { label: typeLabel, color: "blue" }, // e.g. "Near Expiration"
              { label: categoryKey.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()), color: "gray" }
            ];
            

            const finalKey =
            categoryKey === "master_data"
              ? (typeLabel.toLowerCase().replace(/\s+/g, "_"))  // missing_data or incorrect_input
              : categoryKey;
          
          parsedAlerts.push({
            id: alertObj.id,
            type: CATEGORY_MAP[finalKey]?.type || "info",
            title: `${typeLabel} Alert`,
            description: alertObj.message,
            tags: [
              { label: typeLabel, color: "blue" },
              { label: finalKey.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()), color: "gray" },
              ...(CATEGORY_MAP[finalKey]?.tags.map((label) => ({
                label,
                color: label.toLowerCase().replace(/\s+/g, "-"),
              })) || []),
            ],
            time: new Date(alertObj.timestamp).toLocaleString(),
            isNew: !readAlerts.includes(alertObj.id),
            currentStock: 0,
            threshold: 0,
            location: alertObj.product_id === null ? "Supplier" : "Warehouse A",
            productName: alertObj.product_id === null ? "Supplier Alert" : "Unknown",
            productId: alertObj.product_id,
          });
          
            
          });
        }

        setAlerts(parsedAlerts);
      })
      .catch((error) => {
        console.error("Error fetching alerts:", error);
      });
  }, []);

  const categoryCounts = {
    critical: alerts.filter((alert) => alert.type === "critical").length,
    inventory: alerts.filter((alert) =>
      alert.tags.some((tag) => tag.label.toLowerCase().includes("inventory"))
    ).length,
    forecast: alerts.filter((alert) =>
      alert.tags.some((tag) => tag.label.toLowerCase().includes("forecast"))
    ).length,
    master: alerts.filter((alert) =>
      alert.tags.some((tag) => tag.label.toLowerCase().includes("master"))
    ).length,
    other: alerts.filter((alert) =>
      !alert.tags.some((tag) =>
        ["inventory", "forecast"].includes(tag.label.toLowerCase())
      )
    ).length,
  };

  const criticalCount = categoryCounts.critical;
  const criticalAlerts = alerts.filter((alert) => alert.type === "critical");

  const filteredAlerts = alerts.filter((alert) => {
    const matchesSearch =
      alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesPriority =
      !priorityFilter ||
      alert.tags.some((tag) =>
        tag.label.toLowerCase().includes(priorityFilter.toLowerCase())
      );

    const matchesCategory =
      !categoryFilter ||
      alert.tags.some((tag) =>
        tag.label.toLowerCase().includes(categoryFilter.toLowerCase())
      );

      const matchesType =
        !typeFilter ||
        alert.tags.some((tag) => {
          const normalizedTag = tag.label.toLowerCase().replace(/\s+/g, "_");
          const normalizedType = typeFilter.toLowerCase().replace(/\s+/g, "_");
          return normalizedTag === normalizedType;
      });
    
    

    const matchesLocation =
      !locationFilter ||
      alert.location.toLowerCase().includes(locationFilter.toLowerCase());

    const matchesTab =
      activeTab === "All Alerts" ||
      (activeTab === "Unread" && alert.isNew) ||
      (activeTab === "Reviewed" && !alert.isNew) ||
      (activeTab === "Critical" && alert.type === "critical");

    return (
      matchesSearch &&
      matchesPriority &&
      matchesCategory &&
      matchesType &&
      matchesLocation &&
      matchesTab
    );
  });

  const toggleReadStatus = (id, isRead) => {
    const updatedAlerts = alerts.map((alert) =>
      alert.id === id ? { ...alert, isNew: !isRead } : alert
    );
    setAlerts(updatedAlerts);

    if (isRead) {
      saveReadAlertToStorage(id);
    }
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-100 flex flex-col">
        <Routes>
          <Route
            path="/"
            element={
              <>
                <Header criticalCount={criticalCount} criticalAlerts={criticalAlerts} />
                <main className="flex-1 max-w-7xl mx-auto px-4 py-6 w-full">
                  <div className="mb-8">
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-[#041f3a] via-[#2b7886] to-[#3eadc1] bg-clip-text text-transparent">
                      Alert Dashboard for Forecasting and Replenishment
                    </h2>
                    <p className="text-gray-500">
                      Monitor and manage all retail alerts in one place.
                    </p>
                  </div>

                  <AlertSummary
                    categoryCounts={categoryCounts}
                    onSummaryClick={(category) => setTypeFilter(category)}
                  />

                  <AlertFilters
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    setPriorityFilter={setPriorityFilter}
                    setCategoryFilter={setCategoryFilter}
                    setTypeFilter={setTypeFilter}
                    setLocationFilter={setLocationFilter} // ✅ Pass location filter
                  />

                  <div className="grid gap-4 mt-6">
                    {filteredAlerts.length === 0 ? (
                      <div className="text-gray-500">No alerts to show.</div>
                    ) : (
                      filteredAlerts.map((alert) => (
                        <div
                          key={alert.id}
                          className={`bg-white rounded-xl shadow p-4 border-l-4 ${
                            alert.type === "critical"
                              ? "border-red-500"
                              : alert.type === "warning"
                              ? "border-yellow-400"
                              : "border-blue-400"
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="text-lg font-semibold">{alert.title}</h3>
                              <p className="text-gray-600">{alert.description}</p>
                              <div className="text-sm text-gray-500 mt-1">{alert.time}</div>
                              <div className="flex flex-wrap mt-2 gap-2">
                                {alert.tags.map((tag, idx) => (
                                  <span
                                    key={idx}
                                    className="px-2 py-1 text-xs rounded-full bg-gray-200 text-gray-800"
                                  >
                                    {tag.label}
                                  </span>
                                ))}
                              </div>
                            </div>

                            <div className="flex flex-col items-end gap-2">
                              <Link
                                to={`/alerts/${alert.id}`}
                                onClick={() => {
                                  if (alert.isNew) toggleReadStatus(alert.id, true);
                                }}
                                className="text-blue-600 hover:underline text-sm"
                              >
                                Show More
                              </Link>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </main>
              </>
            }
          />
          <Route path="/alerts/:id" element={<AlertDetails alerts={alerts} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
