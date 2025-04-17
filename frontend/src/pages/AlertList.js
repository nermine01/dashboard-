import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAlerts } from "../Util/Alerts/AlertContext";
import { Badge } from "../components/ui/Badge";
import { Card, CardContent } from "../components/ui/Card";

// Constants for alert type styles
const ALERT_TYPE_STYLES = {
  critical: "border-red-500 dark:border-red-400",
  warning: "border-yellow-400 dark:border-yellow-400",
  info: "border-blue-400 dark:border-blue-400",
};

const AlertCard = ({ alert, toggleReadStatus }) => {
  const handleViewDetails = () => {
    if (alert.isNew) {
      toggleReadStatus(alert.id, true);
    }
  };

  return (
    <Card
      className={`overflow-hidden border-l-4 ${ALERT_TYPE_STYLES[alert.type]}`}
    >
      <CardContent className="p-4">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold leading-tight">
                {alert.title}
              </h3>
              {alert.isNew && (
                <Badge
                  variant="outline"
                  className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                >
                  New
                </Badge>
              )}
            </div>

            <p className="text-gray-600 dark:text-gray-300 mt-1.5">
              {alert.description}
            </p>

            <time className="text-sm text-gray-500 dark:text-gray-400 mt-1 block">
              {alert.time}
            </time>

            {alert.tags.length > 0 && (
              <div className="flex flex-wrap mt-2 gap-1.5">
                {alert.tags.map((tag, idx) => (
                  <Badge key={`${tag.label}-${idx}`} variant="secondary">
                    {tag.label}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col items-end gap-2">
            <Link
              to={`/alerts/${alert.id}`}
              onClick={handleViewDetails}
              className="text-[#3eadc1] hover:text-[#2b7886] hover:underline text-sm font-medium transition-colors"
            >
              View Details
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const AlertList = ({
  activeTab,
  searchTerm,
  priorityFilter,
  categoryFilter,
  typeFilter,
}) => {
  const { alerts, loading, error, toggleReadStatus } = useAlerts();

  const filteredAlerts = alerts.filter((alert) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      alert.title.toLowerCase().includes(searchLower) ||
      alert.description.toLowerCase().includes(searchLower);

    const matchesPriority =
      !priorityFilter ||
      alert.tags.some((tag) =>
        tag.label.toLowerCase().includes(priorityFilter.toLowerCase())
      );

    const matchesCategory =
      !categoryFilter ||
      alert.tags.some((tag) =>
        tag.label.toLowerCase().includes(categoryFilter.toLowerCase())
      );

    const matchesType =
      !typeFilter ||
      alert.tags.some((tag) =>
        tag.label.toLowerCase().includes(typeFilter.toLowerCase())
      );

    const matchesTab =
      activeTab === "All Alerts" ||
      (activeTab === "Unread" && alert.isNew) ||
      (activeTab === "Read" && !alert.isNew) ||
      (activeTab === "Critical" && alert.type === "critical");

    return (
      matchesSearch &&
      matchesPriority &&
      matchesCategory &&
      matchesType &&
      matchesTab
    );
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-[#3eadc1]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-red-500">
        <p>Error loading alerts: {error}</p>
      </div>
    );
  }

  if (filteredAlerts.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        <p>No alerts match your current filters.</p>
        <p className="text-sm mt-1">Try adjusting your search or filters.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 mt-6">
      {filteredAlerts.map((alert) => (
        <AlertCard
          key={alert.id}
          alert={alert}
          toggleReadStatus={toggleReadStatus}
        />
      ))}
    </div>
  );
};

export default AlertList;
