import { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Siren, Phone, HeartPulse, Building2, Flame, Waves, MoreHorizontal } from "lucide-react";
import TopBar from "../components/layout/TopBar";
import SosStatusStepper from "../components/sos/SosStatusStepper";
import { sosApi } from "../services/api";
import { useLanguage } from "../context/LanguageContext";
import { useGeolocation } from "../hooks/useGeolocation";

const HOLD_DURATION_MS = 1200; // deliberate short hold to prevent accidental taps, not so long it delays a real emergency

const CATEGORIES = [
  { key: "medical", icon: HeartPulse },
  { key: "trapped", icon: Building2 },
  { key: "fire", icon: Flame },
  { key: "flood", icon: Waves },
  { key: "other", icon: MoreHorizontal },
];

export default function SosPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { requestLocation } = useGeolocation();

  const [phase, setPhase] = useState("idle"); // idle | holding | sending | retrying | sent | failed
  const [sosRecord, setSosRecord] = useState(null);
  const [holdProgress, setHoldProgress] = useState(0);
  const holdTimerRef = useRef(null);
  const holdStartRef = useRef(null);
  const pollRef = useRef(null);

  const submitSos = useCallback(async () => {
    setPhase("sending");
    try {
      const coords = await requestLocation();
      const record = await sosApi.create({ latitude: coords.latitude, longitude: coords.longitude });
      setSosRecord(record);
      setPhase("sent");
    } catch (err) {
      // Network or server failure: queue the intent and keep retrying rather
      // than failing silently — a citizen mid-emergency must see something
      // is happening, not a dead end.
      setPhase("retrying");
      setTimeout(() => submitSos(), 4000);
    }
  }, [requestLocation]);

  const startHold = () => {
    setPhase("holding");
    holdStartRef.current = Date.now();
    holdTimerRef.current = setInterval(() => {
      const elapsed = Date.now() - holdStartRef.current;
      const progress = Math.min(100, (elapsed / HOLD_DURATION_MS) * 100);
      setHoldProgress(progress);
      if (progress >= 100) {
        clearInterval(holdTimerRef.current);
        submitSos();
      }
    }, 30);
  };

  const cancelHold = () => {
    if (phase === "holding") {
      clearInterval(holdTimerRef.current);
      setHoldProgress(0);
      setPhase("idle");
    }
  };

  // Poll for status updates once sent, so the citizen sees Acknowledged/En Route live
  useEffect(() => {
    if (phase === "sent" && sosRecord) {
      pollRef.current = setInterval(async () => {
        try {
          const updated = await sosApi.get(sosRecord.id);
          setSosRecord(updated);
          if (updated.status === "resolved") clearInterval(pollRef.current);
        } catch {
          // transient network issue while polling — silently retry next interval
        }
      }, 5000);
      return () => clearInterval(pollRef.current);
    }
  }, [phase, sosRecord]);

  const setCategory = async (categoryKey) => {
    if (!sosRecord) return;
    try {
      const updated = await sosApi.update(sosRecord.id, { category: categoryKey });
      setSosRecord(updated);
    } catch {
      // best-effort — the SOS itself is already sent and tracked regardless
    }
  };

  return (
    <div className="min-h-screen bg-bg-base flex flex-col">
      <TopBar title={t.sos.title} showBack />

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 max-w-md mx-auto w-full">
        {(phase === "idle" || phase === "holding") && (
          <>
            <button
              onMouseDown={startHold}
              onMouseUp={cancelHold}
              onMouseLeave={cancelHold}
              onTouchStart={startHold}
              onTouchEnd={cancelHold}
              aria-label={t.sos.bigButton}
              className="relative flex items-center justify-center w-56 h-56 rounded-full bg-emergency text-white shadow-lg select-none touch-none"
              style={{
                background: `conic-gradient(#B91C1C ${holdProgress}%, #DC2626 ${holdProgress}%)`,
              }}
            >
              <span className="flex flex-col items-center gap-2 pointer-events-none">
                <Siren size={56} strokeWidth={2} aria-hidden="true" />
                <span className="text-lg font-bold leading-tight px-4">{t.sos.bigButton}</span>
              </span>
            </button>
            <p className="text-text-secondary text-sm text-center mt-6">{t.sos.subtext}</p>
            <a
              href="tel:112"
              className="flex items-center gap-2 text-gov-blue font-semibold mt-6 min-h-tap"
            >
              <Phone size={18} aria-hidden="true" />
              {t.sos.callInstead}
            </a>
          </>
        )}

        {(phase === "sending" || phase === "retrying") && (
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="w-16 h-16 border-4 border-gov-blue border-t-transparent rounded-full animate-spin" />
            <p className="font-semibold text-text-primary">
              {phase === "retrying" ? t.sos.retrying : t.sos.sending}
            </p>
          </div>
        )}

        {phase === "sent" && sosRecord && (
          <div className="w-full flex flex-col gap-6">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-safe-light flex items-center justify-center mb-3">
                <Siren className="text-safe" size={32} />
              </div>
              <h2 className="text-xl font-bold text-text-primary">{t.sos.sentTitle}</h2>
              <p className="text-text-secondary text-sm mt-1">{t.sos.sentSubtitle}</p>
            </div>

            <div className="bg-surface border border-border rounded-lg p-4">
              <SosStatusStepper currentStatus={sosRecord.status} />
            </div>

            {!sosRecord.category && (
              <div>
                <p className="text-sm font-semibold text-text-primary mb-2">{t.sos.categoryPrompt}</p>
                <div className="grid grid-cols-3 gap-2">
                  {CATEGORIES.map(({ key, icon: Icon }) => (
                    <button
                      key={key}
                      onClick={() => setCategory(key)}
                      className="flex flex-col items-center gap-1 min-h-tap py-3 rounded-lg border-2 border-border bg-surface hover:border-gov-blue text-text-primary"
                    >
                      <Icon size={20} aria-hidden="true" />
                      <span className="text-xs font-semibold">{t.sos[`category${key[0].toUpperCase()}${key.slice(1)}`]}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <a
              href="tel:112"
              className="flex items-center justify-center gap-2 min-h-tap bg-emergency text-white font-bold rounded-lg"
            >
              <Phone size={18} aria-hidden="true" />
              {t.sos.callHelpline}
            </a>

            <button
              onClick={() => {
                setSosRecord(null);
                setPhase("idle");
                setHoldProgress(0);
              }}
              className="text-gov-blue font-semibold text-sm min-h-tap"
            >
              {t.sos.newSos}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
