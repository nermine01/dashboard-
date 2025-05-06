import React, { useState, useEffect } from "react";

const AlertDetailsModal = ({ alert, onClose, onResolve }) => {
  const [newThreshold, setNewThreshold] = useState(alert?.threshold || 0);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [thresholdModified, setThresholdModified] = useState(false);

  useEffect(() => {
    // If alert is already resolved, prevent modifying again
    const resolvedIds = JSON.parse(localStorage.getItem("resolvedAlerts") || "[]");
    setThresholdModified(resolvedIds.includes(alert?.id));
  }, [alert?.id]);

  if (!alert) return null;

  const handleSetThreshold = async () => {
    setLoading(true);
    setSuccess(false);
    setError(false);
    setErrorMsg("");

    try {
      const payload = { threshold: newThreshold };

      const response = await fetch(`http://localhost:8000/alerts/${alert.id}/update-threshold`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(true);
        setErrorMsg(errorData.detail || "Update failed");
      } else {
        const data = await response.json();

        alert.threshold = newThreshold;
        alert.message = data.new_message || alert.message;

        setSuccess(true);
        setThresholdModified(true);

        onResolve(alert.id, newThreshold, alert.message); // Pass updated message too
      }
    } catch (err) {
      setError(true);
      setErrorMsg("Network or server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-2xl shadow-lg max-w-3xl w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 hover:text-gray-900"
          aria-label="Close modal"
        >
          &#x2715;
        </button>

        <h2 className="text-3xl font-extrabold mb-4 bg-gradient-to-r from-[#041f3a] via-[#2b7886] to-[#3eadc1] bg-clip-text text-transparent">
          {alert.title}
        </h2>

        <p className="text-gray-600 mb-6">{alert.message}</p>

        <div className="space-y-4">
          <DetailItem label="Alert Type" value={alert.type} />
          <DetailItem label="Time" value={alert.time} />
          <DetailItem label="Current Stock" value={alert.currentStock} />
          <DetailItem label="Threshold" value={alert.threshold} />
          <DetailItem label="Location" value={alert.location} />
          <DetailItem label="Product" value={alert.productName} />
        </div>

        {!thresholdModified && (
          <div className="mt-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Modify Threshold
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3eadc1] focus:outline-none"
                value={newThreshold}
                onChange={(e) => setNewThreshold(Number(e.target.value))}
                disabled={loading}
              />
              <button
                onClick={handleSetThreshold}
                className="px-4 py-2 bg-[#3eadc1] text-white rounded-lg hover:bg-[#35a3b6] transition duration-200"
                disabled={loading}
              >
                {loading ? "Setting..." : "Set"}
              </button>
            </div>
          </div>
        )}

        {success && (
          <p className="text-sm text-green-600 mt-2">
            Threshold updated successfully!
          </p>
        )}

        {error && <p className="text-sm text-red-600 mt-2">{errorMsg}</p>}
      </div>
    </div>
  );
};

const DetailItem = ({ label, value }) => (
  <div className="flex justify-between border-b pb-2 text-gray-700">
    <span className="font-medium">{label}</span>
    <span>{value}</span>
  </div>
);

export default AlertDetailsModal;
