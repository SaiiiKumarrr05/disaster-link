import { Waves, Wind, Activity, Flame, Mountain, Sun, AlertCircle } from "lucide-react";
import SeverityBadge from "../common/SeverityBadge";
import { useLanguage } from "../../context/LanguageContext";

const DISASTER_ICONS = {
  flood: Waves,
  cyclone: Wind,
  earthquake: Activity,
  fire: Flame,
  landslide: Mountain,
  heatwave: Sun,
  other: AlertCircle,
};

const SEVERITY_STRIPE = {
  critical: "border-l-emergency",
  warning: "border-l-warning",
  advisory: "border-l-advisory",
};

function timeAgo(isoString, t) {
  const diffMs = Date.now() - new Date(isoString).getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return t.common.justNow;
  if (diffMin < 60) return `${diffMin} ${t.common.minutesAgo}`;
  return `${Math.floor(diffMin / 60)} ${t.common.hoursAgo}`;
}

export default function AlertCard({ alert, onViewDetails }) {
  const { t } = useLanguage();
  const Icon = DISASTER_ICONS[alert.disaster_type] || AlertCircle;

  return (
    <article
      className={`bg-surface border-2 border-border ${SEVERITY_STRIPE[alert.severity]} border-l-4 rounded-lg p-4 flex flex-col gap-2`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 text-text-secondary flex-shrink-0">
            <Icon size={22} aria-hidden="true" />
          </div>
          <div>
            <h3 className="font-bold text-text-primary leading-snug">{alert.title}</h3>
            <p className="text-sm text-text-secondary mt-0.5">
              {t.dashboard.issuedBy} {alert.issuing_authority} · {timeAgo(alert.issued_at, t)}
            </p>
          </div>
        </div>
        <SeverityBadge severity={alert.severity} />
      </div>

      <p className="text-sm text-text-primary leading-relaxed">{alert.description}</p>

      {onViewDetails && (
        <button
          onClick={() => onViewDetails(alert)}
          className="self-start text-sm font-semibold text-gov-blue hover:underline min-h-tap"
        >
          {t.dashboard.viewDetails} →
        </button>
      )}
    </article>
  );
}
