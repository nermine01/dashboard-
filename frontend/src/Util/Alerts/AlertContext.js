import { createContext, useContext, useState, useEffect } from "react";
import { GetAlerts } from "../../Services/Alert/Alerts";
import {
  getReadAlertsFromStorage,
  saveReadAlertToStorage,
} from "./Alerts";
import { parseAlerts } from "./parseAlerts";

const AlertContext = createContext(undefined);

export const useAlerts = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error("useAlerts must be used within an AlertProvider");
  }
  return context;
};

export const AlertProvider = ({ children }) => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await GetAlerts();
        const readAlerts = getReadAlertsFromStorage();
        const parsedAlerts = parseAlerts(data, readAlerts);
        setAlerts(parsedAlerts);
      } catch (err) {
        setError("Failed to fetch alerts");
        console.error("Error fetching alerts:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const toggleReadStatus = (id, isRead) => {
    const updatedAlerts = alerts.map((alert) =>
      alert.id === id ? { ...alert, isNew: !isRead } : alert
    );
    setAlerts(updatedAlerts);

    if (isRead) {
      saveReadAlertToStorage(id);
    }
  };

  const categoryCounts = {
    critical: alerts.filter((alert) => alert.type === "critical").length,
    inventory: alerts.filter((alert) =>
      alert.tags.some((tag) => tag.label.toLowerCase().includes("inventory"))
    ).length,
    forecast: alerts.filter((alert) =>
      alert.tags.some((tag) => tag.label.toLowerCase().includes("forecast"))
    ).length,
    other: alerts.filter(
      (alert) =>
        !alert.tags.some((tag) =>
          ["inventory", "forecast"].includes(tag.label.toLowerCase())
        )
    ).length,
  };

  const criticalCount = categoryCounts.critical;
  const criticalAlerts = alerts.filter((alert) => alert.type === "critical");

  const value = {
    alerts,
    loading,
    error,
    toggleReadStatus,
    categoryCounts,
    criticalCount,
    criticalAlerts,
  };

  return (
    <AlertContext.Provider value={value}>{children}</AlertContext.Provider>
  );
};
