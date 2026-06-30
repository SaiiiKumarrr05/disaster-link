import { HeartPulse, Building2, Flame, Waves, MoreHorizontal, ChevronRight } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

const CATEGORY_ICONS = {
  medical: HeartPulse,
  trapped: Building2,
  fire: Flame,
  flood: Waves,
  other: MoreHorizontal,
};

const PRIORITY_STYLES = {
  critical: "bg-emergency-light text-emergency-dark border-emergency",
  high: "bg-warning-light text-warning border-warning",
  medium: "bg-advisory-light text-advisory border-advisory",
  low: "bg-bg-base text-text-secondary border-border",
};

function elapsedLabel(isoString) {
  const diffMin = Math.floor((Date.now() - new Date(isoString).getTime()) / 60000);
  if (diffMin < 1) return "<1m";
  if (diffMin < 60) return `${diffMin}m`;
  return `${Math.floor(diffMin / 60)}h ${diffMin % 60}m`;
}

export default function SosQueueRow({ sos, onClick }) {
  const { t } = useLanguage();
  const Icon = CATEGORY_ICONS[sos.category] || MoreHorizontal;

  return (
    <button
      onClick={() => onClick(sos)}
      className="w-full flex items-center gap-3 bg-surface border border-border rounded-lg p-3 text-left hover:border-gov-blue min-h-tap"
    >
      <span className={`flex items-center justify-center w-10 h-10 rounded-full border-2 flex-shrink-0 ${PRIORITY_STYLES[sos.priority]}`}>
        <Icon size={18} aria-hidden="true" />
      </span>
      <span className="flex-1 min-w-0">
        <span className="flex items-center gap-2">
          <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded-full border ${PRIORITY_STYLES[sos.priority]}`}>
            {sos.priority}
          </span>
          <span className="text-xs text-text-secondary">{t.rescue.elapsed}: {elapsedLabel(sos.created_at)}</span>
        </span>
        <span className="block text-sm font-semibold text-text-primary mt-1">
          {sos.latitude.toFixed(4)}, {sos.longitude.toFixed(4)}
        </span>
        {sos.note && <span className="block text-xs text-text-secondary truncate">{sos.note}</span>}
      </span>
      <ChevronRight size={20} className="text-text-secondary flex-shrink-0" aria-hidden="true" />
    </button>
  );
}
