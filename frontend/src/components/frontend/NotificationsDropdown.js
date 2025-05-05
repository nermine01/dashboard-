import React from "react";
import { BellIcon } from "./Icons"; // Optional: same bell icon used

function NotificationsDropdown({ criticalAlerts }) {
  return (
    <div className="absolute right-0 mt-2 w-96 bg-white border border-[#2b7886] rounded-3xl shadow-2xl z-50">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 bg-[#041f3a] text-[#ffa641] font-extrabold rounded-t-3xl border-b border-[#2b7886]">
        <BellIcon className="w-6 h-6" />
        <span className="text-lg">Critical Alerts</span>
      </div>

      {/* Alerts list */}
      <ul className="max-h-72 overflow-y-auto scrollbar-thin scrollbar-thumb-[#3eadc1] scrollbar-track-[#041f3a]">
        {criticalAlerts.length === 0 ? (
          <li className="px-6 py-6 text-[#595959] text-base text-center select-none">
            No critical alerts.
          </li>
        ) : (
          criticalAlerts.map((alert) => (
            <li
              key={alert.id}
              className="px-6 py-4 border-b border-[#d9d9d9] last:border-b-0 hover:bg-[#3eadc1]/20 cursor-pointer transition-colors duration-200"
            >
              <div className="text-base font-semibold text-[#041f3a] select-text">
                {alert.title}
              </div>
              <div className="text-sm text-[#595959] mt-1 select-text">{alert.description}</div>
              <div className="text-xs text-[#3eadc1] mt-2 select-text">
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
