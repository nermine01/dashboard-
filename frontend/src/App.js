import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/frontend/Header";
import AlertSummary from "./components/frontend/AlertSummary";
import AlertFilters from "./components/frontend/AlertFilters";
import AlertDetails from "./components/frontend/AlertDetailsModal";
import { ALERT_TYPE_LABELS, CATEGORY_MAP, getReadAlertsFromStorage, saveReadAlertToStorage } from "./utils/alertUtils";

function App() {
  const [activeTab, setActiveTab] = useState("All Alerts");
  const [alerts, setAlerts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [priorityFilter, setPriorityFilter] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState(null);
  const [typeFilter, setTypeFilter] = useState(null);
  const [locationFilter, setLocationFilter] = useState(null);

  // New state for modal
  const [selectedAlert, setSelectedAlert] = useState(null);

  useEffect(() => {
    // Fetch product groups to map productId to group names
    fetch("http://localhost:8000/products/groups")
      .then((res) => res.json())
      .then((groupData) => {
        const productIdToGroupPath = {};
        groupData.forEach((product) => {
          productIdToGroupPath[product.product_id] = [
            product.group1,
            product.group2,
            product.group3,
            product.group4,
          ].filter(Boolean);
        });

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
                } else if (categoryKey === "master_data") {
                  if (alertObj.message.toLowerCase().includes("missing data")) {
                    typeLabel = "Missing Data";
                  } else if (alertObj.message.toLowerCase().includes("incorrect input")) {
                    typeLabel = "Incorrect Input";
                  } else {
                    typeLabel = "Master Data Issue";
                  }
                } else {
                  typeLabel =
                    ALERT_TYPE_LABELS[categoryKey] ||
                    categoryKey.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
                }

                const finalKey =
                  categoryKey === "master_data"
                    ? typeLabel.toLowerCase().replace(/\s+/g, "_")
                    : categoryKey;

                const locationPath =
                  alertObj.product_id === null
                    ? ["Supplier"]
                    : productIdToGroupPath[alertObj.product_id] || ["Unknown"];

                const priorityLevels = ["High", "Medium", "Low"];
                const randomPriority = priorityLevels[Math.floor(Math.random() * priorityLevels.length)];

                parsedAlerts.push({
                  id: alertObj.id,
                  type: CATEGORY_MAP[finalKey]?.type || "info",
                  title: `${typeLabel} Alert`,
                  description: alertObj.message,
                  tags: [
                    { label: typeLabel, color: "blue" },
                    {
                      label: finalKey.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
                      color: "gray",
                    },
                    ...(CATEGORY_MAP[finalKey]?.tags.map((label) => ({
                      label,
                      color: label.toLowerCase().replace(/\s+/g, "-"),
                    })) || []),
                    { label: randomPriority, color: randomPriority.toLowerCase() }
                  ],
                  time: new Date(alertObj.timestamp).toLocaleString(),
                  isNew: !readAlerts.includes(alertObj.id),
                  currentStock: 0,
                  threshold: 0,
                  location: locationPath,
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
      })
      .catch((error) => {
        console.error("Error fetching product groups:", error);
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
      (Array.isArray(alert.location)
        ? alert.location.some((loc) => loc.toLowerCase().includes(locationFilter.toLowerCase()))
        : alert.location.toLowerCase().includes(locationFilter.toLowerCase()));

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

  const openAlertModal = (alert) => {
    setSelectedAlert(alert);
    // Mark alert as read in local storage and update alert state
    saveReadAlertToStorage(alert.id);
    const updatedAlerts = alerts.map((a) =>
      a.id === alert.id ? { ...a, isNew: false } : a
    );
    setAlerts(updatedAlerts);
  };

  const closeAlertModal = () => {
    setSelectedAlert(null);
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-100 flex flex-col">
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
            setLocationFilter={setLocationFilter}
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
                      <button
                        onClick={() => openAlertModal(alert)}
                        className="text-blue-600 hover:underline text-sm"
                      >
                        Show More
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {selectedAlert && (
            <AlertDetails alert={selectedAlert} onClose={closeAlertModal} />
          )}
        </main>
      </div>
    </Router>
  );
}

export default App;
