import { useState } from "react";
import { Loader2 } from "lucide-react";
import { UpdateAlerts } from "../../Services/Alert/Alerts";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/Card";

const DetailItem = ({ label, value }) => (
  <div className="flex justify-between py-3 border-b border-gray-200 dark:border-gray-700 last:border-0">
    <span className="font-medium text-gray-600 dark:text-gray-300">
      {label}
    </span>
    <span className="text-gray-800 dark:text-gray-100 font-semibold">
      {value}
    </span>
  </div>
);

const AlertDetails = ({ alertId, alerts }) => {
  const alert = alerts.find((a) => a.id === alertId);
  const [newThreshold, setNewThreshold] = useState(alert?.threshold || 0);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ success: false, error: false });

  if (!alert) {
    return (
      <Card className="max-w-3xl mx-auto">
        <CardContent className="p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">
            Alert not found
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            The requested alert could not be located. Please return to the
            dashboard and try again.
          </p>
        </CardContent>
      </Card>
    );
  }

  const handleSetThreshold = async () => {
    setLoading(true);
    setStatus({ success: false, error: false });

    try {
      const response = await UpdateAlerts(alert.productId, newThreshold);

      // Update alert locally with new threshold and description
      alert.threshold = newThreshold;
      if (response?.new_message) {
        alert.description = response.new_message;
      }

      setStatus({ success: true, error: false });
    } catch (err) {
      console.error("Error updating threshold:", err);
      setStatus({ success: false, error: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader className="pb-4">
        <CardTitle className="text-3xl font-extrabold bg-gradient-to-r from-[#041f3a] via-[#2b7886] to-[#3eadc1] bg-clip-text text-transparent">
          {alert.title}
        </CardTitle>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          {alert.description}
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="space-y-2">
          <DetailItem label="Alert Type" value={alert.type} />
          <DetailItem label="Time" value={alert.time} />
          <DetailItem
            label="Current Stock"
            value={alert.currentStock.toString()}
          />
          <DetailItem label="Threshold" value={alert.threshold.toString()} />
          <DetailItem label="Location" value={alert.location} />
          <DetailItem label="Product" value={alert.productName} />
        </div>

        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">
            Update Threshold Settings
          </h3>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 max-w-xs">
              <Input
                type="number"
                value={newThreshold}
                onChange={(e) => setNewThreshold(Number(e.target.value))}
                className="w-full"
                min="0"
              />
            </div>
            <Button
              onClick={handleSetThreshold}
              disabled={loading}
              className="bg-[#3eadc1] hover:bg-[#2b7886] text-white transition-colors shadow-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Threshold"
              )}
            </Button>
          </div>

          {status.success && (
            <p className="mt-2 text-sm text-green-600 dark:text-green-400">
              Threshold updated successfully! The alert description has been
              refreshed.
            </p>
          )}

          {status.error && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">
              Failed to update threshold. Please check your input and try again.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AlertDetails;
