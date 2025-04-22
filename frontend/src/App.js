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
  forecast: "Forecast Alert",
  over_forecasting: "Over Forecasting",
  under_forecasting: "Under Forecasting",
  promotion_incoming: "Promotion Incoming",
  new_product_launch: "New Product Launch",
  seasonal_forecast_issue: "Seasonal Forecast Issue",
  yoy_deviation: "Year-over-Year (Y-O-Y) Deviation",
  delay_issue: "Delay Issue",
  damaged_goods: "Damaged Goods",
  mismatch: "Mismatch",
  quality_issue: "Quality Issue",
  discontinued_product: "Discontinued Product",
  order_cancelled: "Order Cancelled",
  lead_time_alert: "Lead Time Alert",
  supplier_alerts: "Supplier Alerts",
  supplier_performance: "Supplier Performance Alert",
  supplier_contract_expiration: "Supplier Contract Expiration",
  supplier_capacity: "Supplier Capacity Alert",
  warehouse_capacity: "Warehouse Capacity Alert",
  missing_data: "Missing Data",
  incorrect_input: "Incorrect Input",
  return_alerts: "Return Alerts"
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
  low_stock: { type: "critical", tags: ["High Priority", "Inventory", "Low Stock"] },
  shrinkage: { type: "warning", tags: ["High Priority", "Inventory", "Shrinkage"] },
  near_expiration: { type: "warning", tags: ["Inventory", "Expiration"] },
  near_end_of_life: { type: "info", tags: ["Inventory", "Lifecycle"] },
  sufficient_stock: { type: "info", tags: ["Inventory", "OK"] },
  stocktaking: { type: "warning", tags: ["Inventory", "Stocktaking"] },
  product_recall: { type: "critical", tags: ["Recall", "Urgent"] },
  overstock: { type: "info", tags: ["Inventory", "Overstock"] },
  forecast: { type: "warning", tags: ["Medium Priority", "Forecast"] },
  master_data: {
    type: "warning",
    tags: ["Master Data", "Mismatch"]
  },
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
            } else {
              typeLabel =
                ALERT_TYPE_LABELS[categoryKey] ||
                categoryKey.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
            }

            const tags = [
              { label: typeLabel, color: "blue" }, // e.g. "Near Expiration"
              { label: categoryKey.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()), color: "gray" }
            ];
            

            parsedAlerts.push({
              id: alertObj.id,
              type: CATEGORY_MAP[categoryKey]?.type || "info",
              title: `${typeLabel} Alert`,
              description: alertObj.message,
              tags: [
                ...tags,
                ...(CATEGORY_MAP[categoryKey]?.tags.map((label) => ({
                  label,
                  color: label.toLowerCase().replace(/\s+/g, "-"),
                })) || []),
              ],
              time: new Date(alertObj.timestamp).toLocaleString(),
              isNew: !readAlerts.includes(alertObj.id),
              currentStock: 0,
              threshold: 0,
              location: "Unknown",
              productName: "Unknown",
              productId: alertObj.product_id
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
      alert.tags.some((tag) =>
        tag.label.toLowerCase().replace(/\s+/g, "_") === typeFilter.toLowerCase().replace(/\s+/g, "_")
      );
    

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
