"use client";
import { useState } from "react";
import { SearchIcon } from "./Icons";
import Dropdown from "./Dropdown";

const categoryToAlertTypes = {
  "Stock": [
    "Overstock",
    "Low Stock",
    "Stock Shrinkage",
    "Near Expiration",
    "Near End of Life Period",
    "Sufficient Stock",
    "Stocktaking Alert",
    "Product Recall Alert",
    "SKU Velocity Alert",
    "Sales Alert"
  ],
  "Forecast": [
    "Over Forecasting",
    "Under Forecasting",
    "Promotion Incoming",
    "New Product Launch",
    "Seasonal Forecast Issue",
    "Year-over-Year (Y-O-Y) Deviation"
  ],
  "Replenishment": [
    "Delay Issue",
    "Damaged Goods",
    "Mismatch",
    "Quality Issue",
    "Discontinued Product",
    "Order Cancelled",
    "Lead Time Alert",
    "Supplier Alerts",
    "Supplier Performance Alert",
    "Supplier Contract Expiration",
    "Supplier Capacity Alert",
    "Warehouse Capacity Alert"
  ],
  "Data Input": [
    "Missing Data",
    "Incorrect Input"
  ]
};

function AlertFilters({
  activeTab,
  setActiveTab,
  searchTerm,
  setSearchTerm,
  setPriorityFilter,
  setCategoryFilter,
  setTypeFilter,
  setLocationFilter, // ✅ Added new prop
}) {
  const tabs = ["All Alerts", "Unread", "Reviewed", "Resolved", "Critical"];
  const [filteredAlertTypes, setFilteredAlertTypes] = useState([]);

  const handleCategorySelect = (selectedCategory) => {
    setCategoryFilter(selectedCategory);
    setFilteredAlertTypes(categoryToAlertTypes[selectedCategory] || []);
    setTypeFilter(null); // Reset alert type when category changes
  };

  return (
    <div className="mt-8 mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div className="flex space-x-1 rounded-lg border border-gray-200 p-1">
        {tabs.map((tab) => (
          <button
            key={tab}
            className={`px-3 py-1.5 text-sm rounded-md ${
              activeTab === tab ? "bg-blue-500 text-white" : "hover:bg-gray-100"
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="flex flex-col md:flex-row gap-2">
        <div className="relative w-full md:w-64">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
          <input
            type="search"
            placeholder="Search alerts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          <Dropdown label="Priority" items={["High", "Medium", "Low"]} onSelect={setPriorityFilter} />

          <Dropdown
            label="Category"
            items={Object.keys(categoryToAlertTypes)}
            onSelect={handleCategorySelect}
          />

<Dropdown
  label="Alert Type"
  items={filteredAlertTypes}
  onSelect={(value) => setTypeFilter(value.replace(/\s+/g, "_").toLowerCase())}
/>


          <Dropdown
            label="Product Location"
            items={["Group 1", "Group 2", "Group 3", "Group 4"]}
            onSelect={setLocationFilter} // ✅ Now correctly updates location filter
          />
        </div>
      </div>
    </div>
  );
}

export default AlertFilters;
