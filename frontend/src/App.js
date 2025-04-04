import React, { useState } from "react";
import Header from "./components/ui/Header";
import AlertSummary from "./components/ui/AlertSummary";
import AlertFilters from "./components/ui/AlertFilters";
import AlertList from "./components/ui/AlertList";

function App() {
  const [activeTab, setActiveTab] = useState("All Alerts");

  // Sample data for alerts
  const alerts = [
    {
      id: 1,
      type: "critical",
      title: "Low Stock Alert: Product 103",
      description: "Current stock: 1 units. Minimum required: 5 units.",
      tags: [
        { label: "High Priority", color: "high-priority" },
        { label: "Inventory", color: "inventory" },
        { label: "Low Stock", color: "low-stock" },
      ],
      time: "Apr 4, 5:47 AM",
      isNew: true,
    },
    {
      id: 2,
      type: "critical",
      title: "Low Stock Alert: Product 79",
      description: "Current stock: 1 units. Minimum required: 10 units.",
      tags: [
        { label: "High Priority", color: "high-priority" },
        { label: "Inventory", color: "inventory" },
        { label: "Low Stock", color: "low-stock" },
      ],
      time: "Apr 4, 5:47 AM",
      isNew: true,
    },
    {
      id: 3,
      type: "warning",
      title: "Inventory Shrinkage: Product 275",
      description:
        "Expected: 93 units. Actual: 90 units. Discrepancy: 3 units.",
      tags: [
        { label: "High Priority", color: "high-priority" },
        { label: "Inventory", color: "inventory" },
        { label: "Shrinkage", color: "shrinkage" },
      ],
      time: "Apr 4, 5:47 AM",
      isNew: true,
    },
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 py-6 w-full">
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-bold">Alerts Dashboard</h2>
          <p className="text-gray-500">
            Monitor and manage all retail alerts in one place.
          </p>
        </div>

        <AlertSummary />

        <AlertFilters activeTab={activeTab} setActiveTab={setActiveTab} />

        <AlertList alerts={alerts} />
      </main>
    </div>
  );
}

export default App;
