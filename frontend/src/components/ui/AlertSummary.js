import { AlertCircleIcon, PackageIcon, ShoppingBagIcon } from "./Icons";

function SummaryCard({ icon, title, value, description }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm w-full max-w-[250px]">
      <div className="p-2 pb-1">
        <h3 className="text-sm font-medium flex items-center gap-2">
          {icon}
          {title}
        </h3>
      </div>
      <div className="px-2 pb-2">
        <div className="text-xl font-semibold">{value}</div>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
    </div>
  );
}

function AlertSummary({ categoryCounts }) {
  return (
    <div className="flex flex-wrap justify-between gap-2">
      <SummaryCard
        icon={<AlertCircleIcon className="w-4 h-4 text-red-500" />}
        title="Critical Alerts"
        value={categoryCounts.critical || 0}
        description="Requires immediate attention"
      />
      <SummaryCard
        icon={<PackageIcon className="w-4 h-4 text-amber-500" />}
        title="Inventory Alerts"
        value={categoryCounts.inventory || 0}
        description="Stock level notifications"
      />
      <SummaryCard
        icon={<ShoppingBagIcon className="w-4 h-4 text-green-500" />}
        title="Sales Alerts"
        value={categoryCounts.sales || 0}
        description="Sales performance insights"
      />

    </div>
  );
}

export default AlertSummary;
