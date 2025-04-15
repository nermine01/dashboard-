import React from "react";

function NotificationsDropdown({ criticalAlerts }) {
  return (
    <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
      <div className="p-4 border-b border-gray-100 font-bold text-gray-700">
        Critical Alerts
      </div>
      <ul className="max-h-60 overflow-y-auto">
        {criticalAlerts.length === 0 ? (
          <li className="px-4 py-2 text-gray-500">No critical alerts.</li>
        ) : (
          criticalAlerts.map((alert) => (
            <li
              key={alert.id}
              className="px-4 py-2 hover:bg-gray-50 text-sm text-gray-700 border-b last:border-b-0"
            >
              <div className="font-medium">{alert.title}</div>
              <div className="text-xs text-gray-500">{alert.description}</div>
              <div className="text-[10px] text-gray-400 mt-1">{alert.time}</div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

export default NotificationsDropdown;
