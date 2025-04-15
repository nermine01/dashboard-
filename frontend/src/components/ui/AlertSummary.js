import { AlertCircleIcon, PackageIcon, ShoppingBagIcon } from "./Icons";

const SummaryCard = ({ title, count, description, Icon, color }) => {
  return (
    <div className="overflow-hidden border-0 shadow-md bg-white hover:shadow-lg transition-shadow rounded-lg w-full max-w-[400px]">
      <div className="h-1 w-full" style={{ backgroundColor: color }}></div>
      <div className="p-4 pb-2">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium flex items-center gap-2">
            <div
              className="p-2 rounded-full"
              style={{ backgroundColor: `${color}1A` }} // 1A = ~10% opacity in hex
            >
              <Icon className="h-5 w-5" style={{ color: color }} />
            </div>
            {title}
          </h2>
        </div>
      </div>
      <div className="px-4 pb-2">
        <div className="flex flex-col">
          <span className="text-4xl font-bold text-[#041f3a]">{count}</span>
          <p className="text-sm text-[#595959]">{description}</p>
        </div>
      </div>
      <div className="px-4 pb-4">
        <span
          className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium"
          style={{
            backgroundColor: `${color}1A`,
            color: color,
          }}
        >
          {count > 0 ? `+${count} since yesterday` : "-2 since yesterday"}
        </span>
      </div>
    </div>
  );
};

const AlertSummary = ({ categoryCounts }) => {
  return (
    <div className="flex flex-wrap justify-between gap-4">
      <SummaryCard
        Icon={AlertCircleIcon}
        title="Forecast"
        count={0}
        description="Requires immediate attention"
        color="#ef4444"
      />
      <SummaryCard
        Icon={PackageIcon}
        title="Inventory Alerts"
        count={categoryCounts.inventory || 0}
        description="Stock level notifications"
        color="#f59e0b"
      />
      <SummaryCard
        Icon={ShoppingBagIcon}
        title="Master Data"
        count={categoryCounts.master || 0}
        description="Sales performance insights"
        color="#10b981"
      />
    </div>
  );
};

export default AlertSummary;
