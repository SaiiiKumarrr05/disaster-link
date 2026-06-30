import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, RefreshCw } from "lucide-react";
import TopBar from "../components/layout/TopBar";
import SosQueueRow from "../components/rescue/SosQueueRow";
import SosDetailPanel from "../components/rescue/SosDetailPanel";
import { sosApi } from "../services/api";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";

const POLL_INTERVAL_MS = 5000; // MVP polling; production path swaps to Supabase Realtime subscription

export default function RescueDashboardPage() {
  const { t } = useLanguage();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [queue, setQueue] = useState([]);
  const [stats, setStats] = useState(null);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("open"); // 'open' | 'resolved'

  const loadData = useCallback(async () => {
    try {
      const [queueData, statsData] = await Promise.all([
        sosApi.listQueue(tab === "resolved" ? "resolved" : undefined),
        sosApi.stats(),
      ]);
      setQueue(queueData);
      setStats(statsData);
    } catch (err) {
      if (err.status === 401) {
        logout();
        navigate("/login?role=rescue_team");
      }
    } finally {
      setLoading(false);
    }
  }, [tab, logout, navigate]);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [loadData]);

  const handleUpdated = (updatedSos) => {
    setSelected(updatedSos);
    setQueue((prev) =>
      updatedSos.status === "resolved" && tab === "open"
        ? prev.filter((s) => s.id !== updatedSos.id)
        : prev.map((s) => (s.id === updatedSos.id ? updatedSos : s))
    );
    loadData();
  };

  return (
    <div className="min-h-screen bg-bg-base">
      <TopBar
        title={t.rescue.title}
        rightSlot={
          <button
            onClick={() => {
              logout();
              navigate("/");
            }}
            aria-label="Sign out"
            className="flex items-center justify-center min-h-tap min-w-tap rounded-full hover:bg-bg-base"
          >
            <LogOut size={20} aria-hidden="true" />
          </button>
        }
      />

      <div className="max-w-3xl mx-auto px-4 py-4">
        {user && (
          <p className="text-sm text-text-secondary mb-3">
            {user.fullName} · <span className="font-semibold capitalize">{user.role.replace("_", " ")}</span>
          </p>
        )}

        {stats && (
          <div className="grid grid-cols-3 gap-3 mb-4">
            <StatCard label={t.rescue.open} value={stats.open_count} />
            <StatCard label={t.rescue.critical} value={stats.critical_count} accent="emergency" />
            <StatCard
              label={t.rescue.avgResponse}
              value={stats.avg_response_minutes != null ? `${stats.avg_response_minutes}m` : "—"}
            />
          </div>
        )}

        <div className="flex items-center justify-between mb-3">
          <div className="flex gap-2">
            <TabButton active={tab === "open"} onClick={() => setTab("open")} label={t.rescue.queue} />
            <TabButton active={tab === "resolved"} onClick={() => setTab("resolved")} label={t.rescue.resolved} />
          </div>
          <button onClick={loadData} aria-label="Refresh" className="min-h-tap min-w-tap flex items-center justify-center rounded-full hover:bg-bg-base">
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} aria-hidden="true" />
          </button>
        </div>

        <div className="flex flex-col gap-2">
          {loading && queue.length === 0 ? (
            <p className="text-text-secondary text-sm">{t.common.loading}</p>
          ) : queue.length === 0 ? (
            <p className="text-text-secondary text-sm bg-surface border border-border rounded-lg p-4">
              {t.rescue.noOpenCases}
            </p>
          ) : (
            queue.map((sos) => <SosQueueRow key={sos.id} sos={sos} onClick={setSelected} />)
          )}
        </div>
      </div>

      {selected && (
        <SosDetailPanel sos={selected} onClose={() => setSelected(null)} onUpdated={handleUpdated} />
      )}
    </div>
  );
}

function StatCard({ label, value, accent }) {
  const accentClass = accent === "emergency" ? "text-emergency" : "text-text-primary";
  return (
    <div className="bg-surface border border-border rounded-lg p-3 text-center">
      <p className={`text-2xl font-extrabold ${accentClass}`}>{value}</p>
      <p className="text-xs text-text-secondary font-medium mt-0.5">{label}</p>
    </div>
  );
}

function TabButton({ active, onClick, label }) {
  return (
    <button
      onClick={onClick}
      className={`min-h-tap px-4 rounded-full border-2 font-semibold text-sm ${
        active ? "bg-gov-blue text-white border-gov-blue" : "bg-surface text-text-primary border-border"
      }`}
      aria-pressed={active}
    >
      {label}
    </button>
  );
}
