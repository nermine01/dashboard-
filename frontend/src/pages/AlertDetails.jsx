import { useParams } from "react-router-dom";
import { useState } from "react";

const AlertDetails = ({ alerts }) => {
  const { id } = useParams();
  const alert = alerts.find((a) => a.id === id);

  const [newThreshold, setNewThreshold] = useState(alert?.threshold || 0);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false); // Track error state

  if (!alert) {
    return (
      <div className="p-8 text-center text-gray-500">
        <h2 className="text-2xl font-bold">Alert not found</h2>
        <p>Please return to the dashboard and try again.</p>
      </div>
    );
  }

  const handleSetThreshold = async () => {
    setLoading(true);
    setSuccess(false);
    setError(false); // Reset error state

    try {
      const response = await fetch(
        `http://localhost:8000/alerts/${alert.id}/update-threshold`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ threshold: newThreshold }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setSuccess(true);

        // Update alert locally with new threshold and message
        alert.threshold = newThreshold;
        alert.description = data.new_message; // Update the description with the new message
      } else {
        console.error("Failed to update threshold");
        setError(true); // Set error if update fails
      }
    } catch (error) {
      console.error("Error updating threshold:", error);
      setError(true); // Set error if there's an exception
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 bg-white rounded-2xl shadow-md border border-gray-200">
      <h2 className="text-3xl font-extrabold mb-4 bg-gradient-to-r from-[#041f3a] via-[#2b7886] to-[#3eadc1] bg-clip-text text-transparent">
        {alert.title}
      </h2>

      <p className="text-gray-600 mb-6">{alert.description}</p>

      <div className="space-y-4">
        <DetailItem label="Alert Type" value={alert.type} />
        <DetailItem label="Time" value={alert.time} />
        <DetailItem label="Current Stock" value={alert.currentStock} />
        <DetailItem label="Threshold" value={alert.threshold} />
        <DetailItem label="Location" value={alert.location} />
      </div>

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
          />
          <button
            onClick={handleSetThreshold}
            className="px-4 py-2 bg-[#3eadc1] text-white rounded-lg hover:bg-[#35a3b6] transition duration-200"
            disabled={loading}
          >
            {loading ? "Setting..." : "Set"}
          </button>
        </div>

        {success && (
          <p className="text-sm text-green-600 mt-2">
            Threshold updated successfully!
          </p>
        )}

        {error && (
          <p className="text-sm text-red-600 mt-2">
            Failed to update threshold. Please try again.
          </p>
        )}
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

export default AlertDetails;
