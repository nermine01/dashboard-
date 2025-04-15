import React, { useState } from "react";
import NotificationsDropdown from "./NotificationsDropdown";
import { AlertCircleIcon } from "./Icons";

function NotificationButton({ criticalAlerts }) {
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);

  const toggleDropdown = () => {
    setIsDropdownVisible((prev) => !prev);
  };

  return (
    <div className="relative">
      <button
        className="p-2 rounded-full hover:bg-gray-100"
        onClick={toggleDropdown}
      >
        <AlertCircleIcon className="w-5 h-5" />
        <span className="sr-only">Notifications</span>
      </button>

      {isDropdownVisible && (
        <NotificationsDropdown criticalAlerts={criticalAlerts} />
      )}
    </div>
  );
}

export default NotificationButton;
