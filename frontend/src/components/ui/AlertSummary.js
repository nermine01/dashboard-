import { AlertCircleIcon, PackageIcon, ShoppingBagIcon } from "./Icons";

function SummaryCard({ icon, title, value, description, iconColor }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
      <div className="p-4 pb-2">
        <h3 className="text-base font-medium flex items-center gap-2">
          {icon}
          {title}
        </h3>
      </div>
      <div className="px-4 pb-4">
        <div className="text-3xl font-bold">{value}</div>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
    </div>
  );
}

function AlertSummary() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <SummaryCard
        icon={<AlertCircleIcon className="w-5 h-5 text-red-500" />}
        title="Critical Alerts"
        value="4"
        description="Requires immediate attention"
        iconColor="text-red-500"
      />
      <SummaryCard
        icon={<PackageIcon className="w-5 h-5 text-amber-500" />}
        title="Inventory Alerts"
        value="12"
        description="Stock level notifications"
        iconColor="text-amber-500"
      />
      <SummaryCard
        icon={<ShoppingBagIcon className="w-5 h-5 text-green-500" />}
        title="Sales Alerts"
        value="3"
        description="Sales performance insights"
        iconColor="text-green-500"
      />
    </div>
  );
}

export default AlertSummary;
