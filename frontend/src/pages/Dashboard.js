import { useState } from "react";


import AlertList from "./AlertList";
import AlertSummary from "./AlertSummary";
import AlertFilters from "./AlertFilters";
import Header from "./Layouts/Header";
import { useAlerts } from "../Util/Alerts/AlertContext";

const Dashboard = () => {
  const { categoryCounts, criticalCount, criticalAlerts } = useAlerts();
  const [activeTab, setActiveTab] = useState("All Alerts");
  const [searchTerm, setSearchTerm] = useState("");
  const [priorityFilter, setPriorityFilter] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState(null);
  const [typeFilter, setTypeFilter] = useState(null);

  return (
    <>
      <Header criticalCount={criticalCount} criticalAlerts={criticalAlerts} />
      <main className="flex-1 max-w-7xl mx-auto px-4 py-6 w-full">
        <div className="mb-8">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-[#041f3a] via-[#2b7886] to-[#3eadc1] bg-clip-text text-transparent">
            Alerts Dashboard
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
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

        <AlertList
          activeTab={activeTab}
          searchTerm={searchTerm}
          priorityFilter={priorityFilter}
          categoryFilter={categoryFilter}
          typeFilter={typeFilter}
        />
      </main>
    </>
  );
};

export default Dashboard;
