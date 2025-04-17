import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import AlertDetails from "./AlertDetails";
import { useAlerts } from "../../Util/Alerts/AlertContext";
import Header from "../Layouts/Header";

const AlertDetailsPage = () => {
  const { id } = useParams();
  const { alerts } = useAlerts();
  const { criticalCount, criticalAlerts } = useAlerts();

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 w-full">
      <Header criticalCount={criticalCount} criticalAlerts={criticalAlerts} />
      <Link
        to="/"
        className="inline-flex items-center mb-6 text-[#3eadc1] hover:text-[#2b7886] transition-colors"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Dashboard
      </Link>

      <AlertDetails alertId={id ? Number.parseInt(id) : 0} alerts={alerts} />
    </div>
  );
};

export default AlertDetailsPage;
