import React, { useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const COLORS = ["#3b82f6", "#ef4444", "#f59e0b", "#10b981", "#6b7280"];

function AlertAnalyticsAccordion({ alerts, filters }) {
  const [activeTab, setActiveTab] = useState("Alert Severity Distribution");


  const getAlertSeverityDistribution = () => {
    const distribution = {};
    alerts.forEach((alert) => {
      const severity = alert.type || "Unknown";
      distribution[severity] = (distribution[severity] || 0) + 1;
    });
    return Object.entries(distribution).map(([severity, count]) => ({ name: severity, value: count }));
  };

  const getAlertStatusDistribution = () => {
    const distribution = { New: 0, Reviewed: 0 };
    alerts.forEach((alert) => {
      if (alert.isNew) distribution.New += 1;
      else distribution.Reviewed += 1;
    });
    return Object.entries(distribution).map(([status, count]) => ({ name: status, value: count }));
  };

  

  const severityDistribution = getAlertSeverityDistribution();
  const statusDistribution = getAlertStatusDistribution();

  return (
    <div className="border rounded-lg shadow mt-6">
      <div className="p-4 bg-white">
        <div className="flex gap-4 border-b mb-4 flex-wrap">
          {[
            "Alert Severity Distribution",
            "Alert Status",
            // "Products by Filters",
          ].map((tab) => (
            <button
              key={tab}
              className={`px-3 py-1 rounded ${
                activeTab === tab
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        <div style={{ width: "100%", height: 300 }}>
          {activeTab === "Alert Severity Distribution" && (
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={severityDistribution}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill={COLORS[1]}
                  label
                >
                  {severityDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}

          {activeTab === "Alert Status" && (
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={statusDistribution}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill={COLORS[2]}
                  label
                >
                  {statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}

export default AlertAnalyticsAccordion;
