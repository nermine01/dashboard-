import {
  BarChartIcon,
  PackageIcon,
  DatabaseIcon,
} from "lucide-react";

const SummaryCard = ({ title, count, description, Icon, color, accentColor, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="overflow-hidden border-0 shadow-md bg-white hover:shadow-lg transition-shadow rounded-lg w-full max-w-[400px] cursor-pointer"
    >
      <div className="h-1 w-full" style={{ backgroundColor: accentColor }}></div>
      <div className="p-4 pb-2">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium flex items-center gap-2">
            <div
              className="p-2 rounded-full"
              style={{ backgroundColor: `${accentColor}1A` }}
            >
              <Icon className="h-5 w-5" style={{ color: accentColor }} />
            </div>
            {title}
          </h2>
        </div>
      </div>
      <div className="px-4 pb-2">
        <div className="flex flex-col">
          <span className="text-4xl font-bold" style={{ color }}>{count}</span>
          <p className="text-sm text-[#595959]">{description}</p>
        </div>
      </div>
      <div className="px-4 pb-4">
        <span
          className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium"
          style={{
            backgroundColor: `${accentColor}1A`,
            color: accentColor,
          }}
        >
          {count > 0 ? `+${count} this week` : "-2 this week"}
        </span>
      </div>
    </div>
  );
};


const AlertSummary = ({ categoryCounts, onSummaryClick }) => {
  return (
    <div className="flex flex-wrap justify-between gap-4">
      <SummaryCard
        Icon={BarChartIcon}
        title="Forecast Alerts"
        count={categoryCounts.forecast || 0}
        description="Demand anomalies & prediction gaps"
        color="#0a5096"
        accentColor="#21c1de"
        onClick={() => onSummaryClick("forecast")}
      />
      <SummaryCard
        Icon={PackageIcon}
        title="Inventory Alerts"
        count={categoryCounts.inventory || 0}
        description="Low stock, shrinkage, overflows"
        color="#18434a"
        accentColor="#ffa641"
        onClick={() => onSummaryClick("inventory")}
      />
      <SummaryCard
        Icon={DatabaseIcon}
        title="Master Data Alerts"
        count={categoryCounts.master || 0}
        description="Product or location mismatches"
        color="#3eadc1"
        accentColor="#c13e6c"
        onClick={() => onSummaryClick("master_data")}
      />
    </div>
  );
};


export default AlertSummary;
