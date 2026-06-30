import { AlertTriangle, AlertOctagon, Info, CheckCircle2 } from "lucide-react";

const SEVERITY_CONFIG = {
  critical: { bg: "bg-emergency-light", text: "text-emergency-dark", border: "border-emergency", Icon: AlertOctagon, label: "Critical" },
  warning: { bg: "bg-warning-light", text: "text-warning", border: "border-warning", Icon: AlertTriangle, label: "Warning" },
  advisory: { bg: "bg-advisory-light", text: "text-advisory", border: "border-advisory", Icon: Info, label: "Advisory" },
  safe: { bg: "bg-safe-light", text: "text-safe", border: "border-safe", Icon: CheckCircle2, label: "Safe" },
};

export default function SeverityBadge({ severity, label }) {
  const config = SEVERITY_CONFIG[severity] || SEVERITY_CONFIG.advisory;
  const { Icon } = config;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border-2 ${config.bg} ${config.text} ${config.border} text-sm font-semibold`}
    >
      <Icon size={16} strokeWidth={2.5} aria-hidden="true" />
      {label || config.label}
    </span>
  );
}
