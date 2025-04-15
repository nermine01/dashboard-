import { useParams } from "react-router-dom";

const AlertDetails = ({ alerts }) => {
  const { id } = useParams();
  const alert = alerts.find((a) => a.id === id);

  if (!alert) {
    return (
      <div className="p-8 text-center text-gray-500">
        <h2 className="text-2xl font-bold">Alert not found</h2>
        <p>Please return to the dashboard and try again.</p>
      </div>
    );
  }

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
        <input
          type="number"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3eadc1] focus:outline-none"
          defaultValue={alert.threshold}
        />
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
