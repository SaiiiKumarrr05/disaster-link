import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import TopBar from "../components/layout/TopBar";
import AlertCard from "../components/dashboard/AlertCard";
import RiskIndicatorStrip from "../components/dashboard/RiskIndicatorStrip";
import EmergencyContactsCard from "../components/dashboard/EmergencyContactsCard";
import { alertsApi, contactsApi } from "../services/api";
import { useLanguage } from "../context/LanguageContext";

export default function DashboardPage() {
  const { t } = useLanguage();
  const [alerts, setAlerts] = useState([]);
  const [indicators, setIndicators] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [alertsData, contactsData] = await Promise.all([alertsApi.list(), contactsApi.list()]);
      setAlerts(alertsData);
      setContacts(contactsData);

      // Fetch risk indicators for every active alert that has them
      const allIndicators = await Promise.all(
        alertsData.map((a) => alertsApi.riskIndicators(a.id).catch(() => []))
      );
      setIndicators(allIndicators.flat());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div>
      <TopBar
        title={t.appName}
        rightSlot={
          <button
            onClick={loadData}
            aria-label="Refresh"
            className="flex items-center justify-center min-h-tap min-w-tap rounded-full hover:bg-bg-base"
          >
            <RefreshCw size={20} className={loading ? "animate-spin" : ""} aria-hidden="true" />
          </button>
        }
      />

      <div className="max-w-3xl mx-auto px-4 py-5 flex flex-col gap-6">
        {error && (
          <div className="bg-emergency-light border-2 border-emergency text-emergency-dark rounded-lg p-4 text-sm font-medium">
            {t.common.error}
          </div>
        )}

        <RiskIndicatorStrip indicators={indicators} />

        <section aria-labelledby="active-alerts-heading">
          <h2 id="active-alerts-heading" className="text-base font-bold text-text-primary mb-2">
            {t.dashboard.activeAlerts}
          </h2>
          {loading ? (
            <p className="text-text-secondary text-sm">{t.common.loading}</p>
          ) : alerts.length === 0 ? (
            <p className="text-text-secondary text-sm bg-surface border border-border rounded-lg p-4">
              {t.dashboard.noActiveAlerts}
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {alerts.map((alert) => (
                <AlertCard key={alert.id} alert={alert} />
              ))}
            </div>
          )}
        </section>

        <EmergencyContactsCard contacts={contacts} />
      </div>
    </div>
  );
}
