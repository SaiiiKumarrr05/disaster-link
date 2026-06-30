import { useNavigate } from "react-router-dom";
import { Globe, Shield, Phone, LogIn } from "lucide-react";
import TopBar from "../components/layout/TopBar";
import { useLanguage } from "../context/LanguageContext";

export default function MenuPage() {
  const { t, language, toggleLanguage } = useLanguage();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-bg-base">
      <TopBar title={t.nav.menu} />
      <div className="max-w-md mx-auto px-4 py-5 flex flex-col gap-3">
        <button
          onClick={toggleLanguage}
          className="flex items-center justify-between bg-surface border border-border rounded-lg px-4 py-3 min-h-tap"
        >
          <span className="flex items-center gap-3 font-semibold text-text-primary">
            <Globe size={20} className="text-gov-blue" aria-hidden="true" />
            Language / भाषा
          </span>
          <span className="text-sm font-bold text-gov-blue">{language === "en" ? "English" : "हिंदी"}</span>
        </button>

        <button
          onClick={() => navigate("/login?role=rescue_team")}
          className="flex items-center gap-3 bg-surface border border-border rounded-lg px-4 py-3 min-h-tap font-semibold text-text-primary"
        >
          <LogIn size={20} className="text-gov-blue" aria-hidden="true" />
          {t.landing.rescueRole} {t.landing.signIn}
        </button>

        <button
          onClick={() => navigate("/login?role=authority")}
          className="flex items-center gap-3 bg-surface border border-border rounded-lg px-4 py-3 min-h-tap font-semibold text-text-primary"
        >
          <Shield size={20} className="text-gov-blue" aria-hidden="true" />
          {t.landing.authorityRole} {t.landing.signIn}
        </button>

        <a
          href="tel:1078"
          className="flex items-center gap-3 bg-surface border border-border rounded-lg px-4 py-3 min-h-tap font-semibold text-text-primary"
        >
          <Phone size={20} className="text-emergency" aria-hidden="true" />
          National Disaster Helpline — 1078
        </a>
      </div>
    </div>
  );
}
