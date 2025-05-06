
import React, { useState } from "react";
import { RefreshCw, Bell } from "lucide-react";
import NotificationsDropdown from "./NotificationsDropdown";
import logo from "../../assets/LOGO__RETSCI.png";

function Header({ criticalCount, criticalAlerts }) {
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  return (
    <header className="fixed-top top-0 left-0 right-0 z-30 border-b bg-gradient-to-r from-[#041f3a] via-[#2b7886] to-[#3eadc1] shadow-lg">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <img src={logo} alt="Retsci Logo" className="h-10 w-auto" />
          <h1 className="text-white text-2xl font-extrabold tracking-wide select-none">
            retsci Dashboard
          </h1>
        </div>

        <div className="flex items-center gap-6">
          <button
            onClick={() => window.location.reload()}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white bg-opacity-20 text-white hover:bg-opacity-40 transition"
            title="Refresh"
            aria-label="Refresh Dashboard"
          >
            <RefreshCw className="h-6 w-6" />
          </button>

          <div className="relative">
            <button
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white bg-opacity-20 text-white hover:bg-opacity-40 transition"
              aria-label="Notifications"
              title="Notifications"
            >
              <Bell className="h-6 w-6" />
              {criticalCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white shadow-lg">
                  {criticalCount}
                </span>
              )}
            </button>
            {isNotifOpen && (
              <div className="absolute right-0 mt-2 w-80 max-w-xs rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 z-40">
                {/* <NotificationButton criticalAlerts={criticalAlerts} /> */}
                <NotificationsDropdown criticalAlerts={criticalAlerts} />
              </div>
            )}
          </div>

          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white bg-opacity-20 shadow-md">
            <img src={logo} alt="Retsci Logo" className="h-6 w-auto" />
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
