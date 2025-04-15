import React from "react";
import { RefreshCw } from "lucide-react";
import NotificationButton from "./NotificationButton";
import logo from "../../assets/LOGO__RETSCI.png"; // adjust the path if needed

function Header({ criticalCount, criticalAlerts }) {
  return (
    <header className="sticky top-0 z-10 border-b bg-white shadow-sm">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-3">
          <img
            src={logo}
            alt="Retsci Logo"
            className="h-8 w-auto"
          />
          <span className="bg-gradient-to-r from-[#041f3a] to-[#2b7886] bg-clip-text text-xl font-bold text-transparent">
            retsci Dashboard
          </span>
        </div>
        <div className="flex items-center gap-4">
          <button className="flex h-9 w-9 items-center justify-center rounded-full text-[#595959] hover:text-[#3eadc1] hover:bg-[#f0f7f9]">
            <RefreshCw className="h-5 w-5" />
          </button>
          <div className="relative">
            {criticalCount > 0 && (
              <div className="absolute -right-2 -top-2 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {criticalCount}
              </div>
            )}
            <NotificationButton criticalAlerts={criticalAlerts} />
          </div>
          <div className="h-9 w-9 overflow-hidden  bg-gradient-to-r from-[#3eadc1] to-[#21c1de] flex items-center justify-center text-white text-sm font-medium shadow-md">
            <img
              src={logo}
              alt="Retsci Logo"
              className="h-5 w-auto"
            />
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
