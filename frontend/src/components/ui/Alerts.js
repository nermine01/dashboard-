
"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  Search,
  ShoppingCart,
  Package,
  AlertTriangle,
  CheckCircle,
  Info,
  Calendar,
  MoreHorizontal,
} from "lucide-react";

const AlertCard = ({ alert, onMarkAsRead, onDismiss }) => {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const alertType = alert.id.split("-")[0];

  const getAlertTypeIcon = () => {
    switch (alertType) {
      case "overstock": case "stocktaking":
        return <Package className="w-5 h-5" />;
      case "low_stock": case "shrinkage": case "product_recall":
        return <AlertTriangle className="w-5 h-5" />;
      case "near_expiration":
        return <Calendar className="w-5 h-5" />;
      case "near_end_of_life":
        return <Info className="w-5 h-5" />;
      case "sufficient_stock":
        return <CheckCircle className="w-5 h-5" />;
      case "forecast":
        return <ShoppingCart className="w-5 h-5" />;
      default:
        return <Info className="w-5 h-5" />;
    }
  };

  const getColor = (type, value) => {
    const map = {
      priority: {
        high: "text-red-600 bg-red-100",
        medium: "text-amber-600 bg-amber-100",
        low: "text-green-600 bg-green-100",
      },
      category: {
        inventory: "bg-purple-100 text-purple-600",
        forecast: "bg-blue-100 text-blue-600",
        customer: "bg-green-100 text-green-600",
        security: "bg-red-100 text-red-600",
      },
      alertType: {
        overstock: "bg-blue-100 text-blue-600",
        low_stock: "bg-red-100 text-red-600",
        shrinkage: "bg-amber-100 text-amber-600",
        near_expiration: "bg-orange-100 text-orange-600",
        near_end_of_life: "bg-gray-100 text-gray-600",
        sufficient_stock: "bg-green-100 text-green-600",
        stocktaking: "bg-purple-100 text-purple-600",
        product_recall: "bg-red-100 text-red-600",
        forecast: "bg-indigo-100 text-indigo-600",
      },
    };
    return map[type]?.[value] || "bg-gray-100 text-gray-600";
  };

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });

  const formatAlertType = (type) =>
    type.split("_").map((w) => w[0].toUpperCase() + w.slice(1)).join(" ");

  return (
    <div className={`mb-4 overflow-hidden bg-white rounded-lg shadow border ${!alert.read ? "border-l-4 border-l-blue-500" : "border"}`}>
      <div className="p-4 flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getColor("alertType", alertType)}`}>
            {getAlertTypeIcon()}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-medium">{alert.title}</h3>
              {!alert.read && (
                <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-800">New</span>
              )}
            </div>
            <p className="text-sm text-gray-600 line-clamp-2">{alert.description}</p>
            {expanded && alert.details && (
              <div className="mt-2 text-sm">
                <p>{alert.details}</p>
                {alert.actionRequired && (
                  <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded text-amber-800">
                    <strong>Action required:</strong> {alert.actionRequired}
                  </div>
                )}
              </div>
            )}
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getColor("priority", alert.priority)}`}>
                {alert.priority[0].toUpperCase() + alert.priority.slice(1)} Priority
              </span>
              <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getColor("category", alert.category)}`}>
                {alert.category[0].toUpperCase() + alert.category.slice(1)}
              </span>
              <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getColor("alertType", alertType)}`}>
                {formatAlertType(alertType)}
              </span>
              <span className="text-xs text-gray-500">{formatDate(alert.timestamp)}</span>
            </div>
          </div>
        </div>
        <div className="flex items-start gap-2">
          {alert.details && (
            <button className="px-2 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded" onClick={() => navigate(`/alerts/${alert.id}`)}>
              Show more
            </button>
          )}
          <div className="relative">
            <button className="p-1 text-gray-600 hover:bg-gray-100 rounded-full" onClick={() => setShowDropdown(!showDropdown)}>
              <MoreHorizontal className="w-4 h-4" />
              <span className="sr-only">More options</span>
            </button>
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                {!alert.read && (
                  <button className="flex items-center w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100" onClick={() => { onMarkAsRead(alert.id); setShowDropdown(false); }}>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Mark as read
                  </button>
                )}
                <button className="flex items-center w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100" onClick={() => { onDismiss(alert.id); setShowDropdown(false); }}>
                  Dismiss
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Alerts;
