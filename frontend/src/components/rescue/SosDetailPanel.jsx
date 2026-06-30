import { useState } from "react";
import { X, Copy } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import SosStatusStepper from "../sos/SosStatusStepper";
import { sosApi } from "../../services/api";

export default function SosDetailPanel({ sos, onClose, onUpdated }) {
  const { t } = useLanguage();
  const [updating, setUpdating] = useState(false);
  const [unit, setUnit] = useState("");

  if (!sos) return null;

  const changeStatus = async (status) => {
    setUpdating(true);
    try {
      const updated = await sosApi.updateStatus(sos.id, { status, assigned_unit: unit || undefined });
      onUpdated(updated);
    } catch {
      // surfaced implicitly: button stays enabled, rescuer can retry the tap
    } finally {
      setUpdating(false);
    }
  };

  const copyCoords = () => {
    navigator.clipboard?.writeText(`${sos.latitude}, ${sos.longitude}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex md:items-center md:justify-center bg-black/40" role="dialog" aria-modal="true">
      <div className="bg-surface w-full h-full md:h-auto md:max-w-lg md:rounded-lg overflow-y-auto">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 className="font-bold text-text-primary">{t.rescue.caseDetails}</h2>
          <button onClick={onClose} aria-label={t.common.close} className="min-h-tap min-w-tap flex items-center justify-center">
            <X size={22} aria-hidden="true" />
          </button>
        </div>

        <div className="p-4 flex flex-col gap-4">
          <SosStatusStepper currentStatus={sos.status} />

          <div>
            <p className="text-xs font-semibold text-text-secondary uppercase mb-1">{t.rescue.gpsCoordinates}</p>
            <button
              onClick={copyCoords}
              className="flex items-center gap-2 text-sm font-mono text-text-primary bg-bg-base px-3 py-2 rounded-lg min-h-tap"
            >
              {sos.latitude.toFixed(5)}, {sos.longitude.toFixed(5)}
              <Copy size={14} aria-hidden="true" />
            </button>
          </div>

          {sos.category && (
            <div>
              <p className="text-xs font-semibold text-text-secondary uppercase mb-1">Category</p>
              <p className="text-sm font-semibold text-text-primary capitalize">{sos.category}</p>
            </div>
          )}

          {sos.note && (
            <div>
              <p className="text-xs font-semibold text-text-secondary uppercase mb-1">{t.rescue.citizenNote}</p>
              <p className="text-sm text-text-primary bg-bg-base px-3 py-2 rounded-lg">{sos.note}</p>
            </div>
          )}

          <div>
            <label htmlFor="assign-unit" className="block text-xs font-semibold text-text-secondary uppercase mb-1">
              {t.rescue.assignUnit}
            </label>
            <input
              id="assign-unit"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              placeholder="e.g. NDRF Unit 4"
              className="w-full min-h-tap px-3 rounded-lg border-2 border-border focus:border-gov-blue outline-none text-sm"
            />
          </div>

          <div className="flex flex-col gap-2 mt-2">
            {sos.status === "submitted" && (
              <ActionButton label={t.rescue.acknowledge} onClick={() => changeStatus("acknowledged")} disabled={updating} />
            )}
            {(sos.status === "submitted" || sos.status === "acknowledged") && (
              <ActionButton label={t.rescue.markEnRoute} onClick={() => changeStatus("en_route")} disabled={updating} variant="warning" />
            )}
            {sos.status !== "resolved" && (
              <ActionButton label={t.rescue.markResolved} onClick={() => changeStatus("resolved")} disabled={updating} variant="safe" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ActionButton({ label, onClick, disabled, variant = "blue" }) {
  const styles = {
    blue: "bg-gov-blue hover:bg-gov-blue-dark",
    warning: "bg-warning hover:opacity-90",
    safe: "bg-safe hover:opacity-90",
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`min-h-tap text-white font-bold rounded-lg disabled:opacity-50 ${styles[variant]}`}
    >
      {label}
    </button>
  );
}
