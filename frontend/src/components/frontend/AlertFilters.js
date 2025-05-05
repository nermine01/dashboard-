"use client";
import { useState, useEffect } from "react";
import { SearchIcon } from "./Icons";
import Dropdown from "./Dropdown";
import NestedDropdown from "./NestedDropdown";

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
  const [groupData, setGroupData] = useState(null);

  const handleCategorySelect = (selectedCategory) => {
    setCategoryFilter(selectedCategory);
    setFilteredAlertTypes(categoryToAlertTypes[selectedCategory] || []);
    setTypeFilter(null); // Reset alert type when category changes
  };

  useEffect(() => {
    fetch("http://localhost:8000/products/groups")
      .then((res) => res.json())
      .then((data) => {
        const tree = {};

        data.forEach((product) => {
          const g1 = product.group1;
          const g2 = product.group2;
          const g3 = product.group3;
          const g4 = product.group4;
          const productName = product.product_name;

          if (!g1) return;

          if (!tree[g1]) tree[g1] = {};
          if (g2) {
            if (!tree[g1][g2]) tree[g1][g2] = {};
            if (g3) {
              if (!tree[g1][g2][g3]) tree[g1][g2][g3] = {};
              if (g4) {
                if (!tree[g1][g2][g3][g4]) tree[g1][g2][g3][g4] = new Set();
                tree[g1][g2][g3][g4].add(productName);
              } else {
                if (!tree[g1][g2][g3]._products) tree[g1][g2][g3]._products = new Set();
                tree[g1][g2][g3]._products.add(productName);
              }
            } else {
              if (!tree[g1][g2]._products) tree[g1][g2]._products = new Set();
              tree[g1][g2]._products.add(productName);
            }
          } else {
            if (!tree[g1]._products) tree[g1]._products = new Set();
            tree[g1]._products.add(productName);
          }
        });

        function convertSetsToArrays(obj) {
          Object.entries(obj).forEach(([key, value]) => {
            if (value instanceof Set) {
              obj[key] = Array.from(value);
            } else if (typeof value === "object") {
              convertSetsToArrays(value);
            }
          });
        }
        convertSetsToArrays(tree);

        setGroupData(tree);
      })
      .catch((error) => {
        console.error("Error fetching product groups:", error);
      });
  }, []);

  return (
    <div className="mt-8 mb-6 flex flex-col gap-4">
      <div className="flex flex-row items-center justify-between gap-4 w-full">
        <div className="flex justify-evenly space-x-1 rounded-lg border border-[#2b7886] p-1 flex-grow max-w-[600px] bg-white">
          {tabs.map((tab) => (
            <button
              key={tab}
              className={`px-4 py-2 text-sm rounded-md font-semibold transition-colors duration-200 w-24 text-[#041f3a] ${
                activeTab === tab
                  ? "bg-[#3eadc1] text-white shadow-md"
                  : "bg-white hover:bg-[#3eadc1]/20"
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="relative w-72 flex-shrink-0">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-[#3eadc1] w-5 h-5" />
          <input
            type="search"
            placeholder="Search alerts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-3 py-3 border border-[#2b7886] rounded-lg text-sm text-[#041f3a] focus:outline-none focus:ring-2 focus:ring-[#3eadc1] focus:border-[#3eadc1]"
          />
        </div>
      </div>

      <div className="flex flex-row items-center gap-2 w-full">
        <div className="flex flex-row gap-2 flex-grow">
          <Dropdown
            label="Priority"
            items={["High", "Medium", "Low"]}
            onSelect={(value) => setPriorityFilter(value === "All" ? null : value)}
          />

          <Dropdown
            label="Category"
            items={Object.keys(categoryToAlertTypes)}
            onSelect={(value) => {
              if (value === "All") {
                setCategoryFilter(null);
                setFilteredAlertTypes([]);
                setTypeFilter(null);
              } else {
                handleCategorySelect(value);
              }
            }}
          />

          <Dropdown
            label="Alert Type"
            items={filteredAlertTypes}
            onSelect={(value) => setTypeFilter(value === "All" ? null : value.replace(/\s+/g, "_").toLowerCase())}
          />

          {groupData ? (
            <NestedDropdown
              label="Product Location"
              groups={groupData}
              onSelect={(value) => setLocationFilter(value === "All" ? null : value)}
            />
          ) : (
            <Dropdown
              label="Product Location"
              items={["Loading..."]}
              onSelect={() => {}}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default AlertFilters;
