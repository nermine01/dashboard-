import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/ui/Header";
import AlertSummary from "./components/ui/AlertSummary";
import AlertFilters from "./components/ui/AlertFilters";
import AlertList from "./components/ui/AlertList";
import AlertDetails from "./pages/AlertDetails";

const CATEGORY_MAP = {
  low_stock: { type: "critical", tags: ["High Priority", "Inventory", "Low Stock"] },
  shrinkage: { type: "warning", tags: ["High Priority", "Inventory", "Shrinkage"] },
  near_expiration: { type: "warning", tags: ["Inventory", "Expiration"] },
  near_end_of_life: { type: "info", tags: ["Inventory", "Lifecycle"] },
  sufficient_stock: { type: "info", tags: ["Inventory", "OK"] },
  stocktaking: { type: "warning", tags: ["Inventory", "Stocktaking"] },
  product_recall: { type: "critical", tags: ["Recall", "Urgent"] },
  overstock: { type: "info", tags: ["Inventory", "Overstock"] },
  forecast: { type: "info", tags: ["forecast", "Info"] },
};

function App() {
  const [activeTab, setActiveTab] = useState("All Alerts");
  const [alerts, setAlerts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [priorityFilter, setPriorityFilter] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState(null);
  const [typeFilter, setTypeFilter] = useState(null);

  useEffect(() => {
    fetch("http://localhost:8000/alerts")
      .then((res) => res.json())
      .then((data) => {
        const parsedAlerts = [];
  
        for (const category in data.alerts) {
          const categoryAlerts = data.alerts[category];
          categoryAlerts.forEach((alertText, index) => {
            const stockMatch = alertText.match(/Stock:\s*(\d+)/i);
            const thresholdMatch = alertText.match(/\((?:Max|Reorder Point|Ideal):\s*(\d+)\)/i);
            const locationMatch = alertText.match(/at (.*?) (?:is|has|detected)/i);
            const productMatch = alertText.match(/ALERT: (.*?) at/i);
  
            const currentStock = stockMatch ? parseInt(stockMatch[1]) : 0;
            const threshold = thresholdMatch ? parseInt(thresholdMatch[1]) : 0;
            const location = locationMatch ? locationMatch[1] : "Unknown";
            const productName = productMatch ? productMatch[1] : "Unknown";
  
            parsedAlerts.push({
              id: `${category}-${index}`,
              type: CATEGORY_MAP[category]?.type || "info",
              title: `${category.replace(/_/g, " ")} alert`,
              description: alertText,
              tags:
                CATEGORY_MAP[category]?.tags.map((label) => ({
                  label,
                  color: label.toLowerCase().replace(/\s+/g, "-"),
                })) || [],
              time: new Date().toLocaleString(),
              isNew: true,
              currentStock,
              threshold,
              location,
              productName,
            });
          });
        }
  
        setAlerts(parsedAlerts);
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
        tag.label.toLowerCase().includes(typeFilter.toLowerCase())
      );

    const matchesTab =
      activeTab === "All Alerts" ||
      (activeTab === "Unread" && alert.isNew) ||
      (activeTab === "Critical" && alert.type === "critical");

    return (
      matchesSearch &&
      matchesPriority &&
      matchesCategory &&
      matchesType &&
      matchesTab
    );
  });

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
                      Alerts Dashboard
                    </h2>
                    <p className="text-gray-500">
                      Monitor and manage all retail alerts in one place.
                    </p>
                  </div>

                  <AlertSummary categoryCounts={categoryCounts} />

                  <AlertFilters
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    setPriorityFilter={setPriorityFilter}
                    setCategoryFilter={setCategoryFilter}
                    setTypeFilter={setTypeFilter}
                  />

                  <AlertList alerts={filteredAlerts} />
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
