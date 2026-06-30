import { useNavigate, useLocation } from "react-router-dom";
import { Siren } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

/**
 * Always-reachable SOS entry point. Per the PRD this is the one navigation
 * rule that overrides normal IA: a person should never have to "find" SOS.
 * Hidden only on the SOS page itself (to avoid stacking on top of the real
 * SOS flow) and on rescue/authority screens (not a citizen action there).
 */
export default function PersistentSOSButton() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();

  const hiddenOn = ["/sos", "/rescue", "/login", "/"];
  if (hiddenOn.includes(location.pathname)) return null;

  return (
    <button
      onClick={() => navigate("/sos")}
      aria-label={t.sos.title}
      className="fixed bottom-20 right-4 md:bottom-8 md:right-8 z-50 flex items-center gap-2 bg-emergency hover:bg-emergency-dark active:scale-95 text-white font-bold rounded-full shadow-lg px-5 py-4 min-h-tap transition-transform"
    >
      <Siren size={24} strokeWidth={2.5} aria-hidden="true" />
      <span className="text-base">{t.nav.sos}</span>
    </button>
  );
}
