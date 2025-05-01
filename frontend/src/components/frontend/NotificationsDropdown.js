import React from "react";
import { BellIcon } from "./Icons"; // Optional: same bell icon used

function NotificationsDropdown({ criticalAlerts }) {
  return (
    <div className="absolute right-0 mt-2 w-96 bg-white border border-[#2b7886] rounded-2xl shadow-xl z-50">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 bg-[#041f3a] text-[#21c1de] font-bold rounded-t-2xl">
        <BellIcon className="w-5 h-5 text-[#ffa641]" />
        Critical Alerts
      </div>

      {/* Alerts list */}
      <ul className="max-h-72 overflow-y-auto scrollbar-thin scrollbar-thumb-[#d9d9d9]">
        {criticalAlerts.length === 0 ? (
          <li className="px-4 py-4 text-[#595959] text-sm">
            No critical alerts.
          </li>
        ) : (
          criticalAlerts.map((alert) => (
            <li
              key={alert.id}
              className="px-4 py-3 border-b border-[#d9d9d9] last:border-b-0 hover:bg-[#f9f9f9]"
            >
              <div className="text-sm font-semibold text-[#0a5096]">
                {alert.title}
              </div>
              <div className="text-sm text-[#595959]">{alert.description}</div>
              <div className="text-[10px] text-[#0a5096] mt-1">
                {alert.time}
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

export default NotificationsDropdown;
