import { AlertCircle, Package, TrendingUp, MoreHorizontal } from "lucide-react";
import { motion } from "framer-motion";

const summaryItems = (categoryCounts) => [
  {
    title: "Critical Alerts",
    count: categoryCounts.critical,
    icon: AlertCircle,
    color: {
      bg: "bg-red-100 dark:bg-red-900/20",
      text: "text-red-600 dark:text-red-400",
      hover: "hover:bg-red-50 dark:hover:bg-red-900/30",
    },
  },
  {
    title: "Inventory Alerts",
    count: categoryCounts.inventory,
    icon: Package,
    color: {
      bg: "bg-blue-100 dark:bg-blue-900/20",
      text: "text-blue-600 dark:text-blue-400",
      hover: "hover:bg-blue-50 dark:hover:bg-blue-900/30",
    },
  },
  {
    title: "Forecast Alerts",
    count: categoryCounts.forecast,
    icon: TrendingUp,
    color: {
      bg: "bg-purple-100 dark:bg-purple-900/20",
      text: "text-purple-600 dark:text-purple-400",
      hover: "hover:bg-purple-50 dark:hover:bg-purple-900/30",
    },
  },
  {
    title: "Other Alerts",
    count: categoryCounts.other,
    icon: MoreHorizontal,
    color: {
      bg: "bg-gray-100 dark:bg-gray-800",
      text: "text-gray-600 dark:text-gray-400",
      hover: "hover:bg-gray-50 dark:hover:bg-gray-700",
    },
  },
];

const AlertSummary = ({ categoryCounts }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {summaryItems(categoryCounts).map((item, index) => (
        <motion.div
          key={item.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
          className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 flex items-center border border-transparent ${item.color.hover} transition-all duration-200 hover:shadow-md hover:border-gray-200 dark:hover:border-gray-700`}
        >
          <div
            className={`${item.color.bg} ${item.color.text} p-3 rounded-full mr-4 flex-shrink-0 transition-all duration-200`}
          >
            <item.icon className="h-5 w-5" />
          </div>
          <div className="overflow-hidden">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
              {item.title}
            </h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {item.count}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default AlertSummary;
