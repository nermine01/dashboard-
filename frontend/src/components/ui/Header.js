import { ShoppingCartIcon, AlertCircleIcon } from "./Icons";

function Header() {
  return (
    <header className="sticky top-0 z-10 w-full border-b border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShoppingCartIcon className="w-6 h-6" />
          <h1 className="text-xl md:text-2xl font-bold">RetailPro Dashboard</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="absolute -right-2 -top-2 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
              16
            </div>
            <button className="p-2 rounded-full hover:bg-gray-100">
              <AlertCircleIcon className="w-5 h-5" />
              <span className="sr-only">Notifications</span>
            </button>
          </div>
          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-800">
            RP
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
