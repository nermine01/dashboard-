import { AlertCircleIcon, AlertTriangleIcon, MoreVerticalIcon } from "./Icons";

function AlertItem({ alert }) {
  const { type, title, description, tags, time, isNew } = alert;

  // Determine which icon to use based on alert type
  const getIcon = () => {
    if (type === "critical") {
      return <AlertCircleIcon className="w-6 h-6 text-red-500" />;
    } else if (type === "warning") {
      return <AlertTriangleIcon className="w-6 h-6 text-amber-500" />;
    }
    return null;
  };

  // Map tag colors to Tailwind classes
  const getTagClasses = (color) => {
    switch (color) {
      case "high-priority":
        return "bg-red-100 text-red-800";
      case "inventory":
        return "bg-indigo-100 text-indigo-800";
      case "low-stock":
        return "bg-orange-100 text-orange-800";
      case "shrinkage":
        return "bg-amber-100 text-amber-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white">
      <div className="flex items-start gap-4 flex-col sm:flex-row">
        <div className="flex-shrink-0 rounded-full bg-white p-1">
          {getIcon()}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold">{title}</h3>
            {isNew && (
              <span className="text-xs font-medium px-2 py-0.5 rounded-full border border-gray-200">
                New
              </span>
            )}
          </div>

          <p className="mt-1 text-sm text-gray-500">{description}</p>

          <div className="mt-2 flex flex-wrap gap-2">
            {tags.map((tag, index) => (
              <span
                key={index}
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getTagClasses(
                  tag.color
                )}`}
              >
                {tag.label}
              </span>
            ))}
            <span className="inline-flex items-center text-xs text-gray-500">
              {time}
            </span>
          </div>
        </div>

        <div className="flex sm:flex-col items-end gap-2 w-full sm:w-auto">
          <button className="text-sm text-gray-500 hover:bg-gray-100 px-2 py-1 rounded-md">
            Show more
          </button>

          <div className="relative">
            <button className="p-1 rounded-md hover:bg-gray-100">
              <MoreVerticalIcon className="w-4 h-4" />
              <span className="sr-only">More options</span>
            </button>

            <div className="hidden absolute right-0 mt-1 w-40 bg-white border border-gray-200 rounded-lg shadow-md z-10 group-hover:block">
              <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 first:rounded-t-lg">
                Mark as read
              </button>
              <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100">
                Assign
              </button>
              <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 last:rounded-b-lg">
                Resolve
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AlertList({ alerts }) {
  return (
    <div className="mt-6 space-y-4">
      {alerts.map((alert) => (
        <AlertItem key={alert.id} alert={alert} />
      ))}
    </div>
  );
}

export default AlertList;
