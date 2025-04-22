import React, { useState } from "react";
import NotificationsDropdown from "./NotificationsDropdown";
import { BellIcon } from "./Icons";

function NotificationButton({ criticalAlerts }) {
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);

  const toggleDropdown = () => {
    setIsDropdownVisible((prev) => !prev); // Toggle visibility state
  };

  return (
    <div className="relative">
      <button
        className="p-3 rounded-full hover:bg-[#21c1de]/10 transition-colors duration-200"
        onClick={toggleDropdown}
      >
        <BellIcon className="w-6 h-6 text-[#21c1de]" />
        <span className="sr-only">Notifications</span>
      </button>

      {/* Conditionally render the notifications dropdown */}
      {isDropdownVisible && <NotificationsDropdown criticalAlerts={criticalAlerts} />}
    </div>
  );
}

export default NotificationButton;
