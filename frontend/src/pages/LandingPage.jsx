import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Siren, MapPin, Shield, Users, ShieldCheck, Phone } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { alertsApi } from "../services/api";
import SeverityBadge from "../components/common/SeverityBadge";

export default function LandingPage() {
  const { t, language, toggleLanguage } = useLanguage();
  const navigate = useNavigate();
  const [topAlert, setTopAlert] = useState(null);

  useEffect(() => {
    alertsApi
      .list()
      .then((alerts) => {
        // Show the single highest-severity active alert as the top banner
        const order = { critical: 0, warning: 1, advisory: 2 };
        const sorted = [...alerts].sort((a, b) => order[a.severity] - order[b.severity]);
        setTopAlert(sorted[0] || null);
      })
      .catch(() => setTopAlert(null));
  }, []);

  return (
    <div className="min-h-screen bg-bg-base flex flex-col">
      <header className="bg-surface border-b border-border">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="text-gov-blue" size={28} strokeWidth={2.5} aria-hidden="true" />
            <span className="font-extrabold text-lg text-text-primary">{t.appName}</span>
          </div>
          <button
            onClick={toggleLanguage}
            className="min-h-tap px-4 rounded-full border-2 border-gov-blue text-gov-blue font-bold text-sm"
          >
            {language === "en" ? "हिंदी" : "English"}
          </button>
        </div>
      </header>

      {topAlert && (
        <div className="bg-emergency-light border-b-2 border-emergency px-4 py-3">
          <div className="max-w-5xl mx-auto flex flex-wrap items-center gap-3">
            <SeverityBadge severity={topAlert.severity} />
            <p className="text-sm font-semibold text-text-primary">
              {topAlert.title} — {topAlert.affected_state}
              {topAlert.affected_district ? `, ${topAlert.affected_district}` : ""}
            </p>
          </div>
        </div>
      )}

      <main className="flex-1">
        <section className="max-w-3xl mx-auto px-4 pt-10 pb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold text-text-primary leading-tight">
            {t.landing.tagline}
          </h1>

          <div className="flex flex-col gap-3 mt-8 max-w-sm mx-auto">
            <button
              onClick={() => navigate("/sos")}
              className="flex items-center justify-center gap-3 min-h-tap py-4 bg-emergency hover:bg-emergency-dark text-white font-bold text-lg rounded-lg shadow-md"
            >
              <Siren size={24} aria-hidden="true" />
              {t.landing.sosCta}
            </button>
            <button
              onClick={() => navigate("/shelter-finder")}
              className="flex items-center justify-center gap-3 min-h-tap py-4 bg-gov-blue hover:bg-gov-blue-dark text-white font-bold text-lg rounded-lg shadow-md"
            >
              <MapPin size={24} aria-hidden="true" />
              {t.landing.shelterCta}
            </button>
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-4 pb-10">
          <div className="grid md:grid-cols-3 gap-4">
            <RoleCard
              icon={<Users size={26} />}
              title={t.landing.citizenRole}
              desc={t.landing.citizenRoleDesc}
              actionLabel={t.landing.continue}
              onClick={() => navigate("/dashboard")}
            />
            <RoleCard
              icon={<ShieldCheck size={26} />}
              title={t.landing.rescueRole}
              desc={t.landing.rescueRoleDesc}
              actionLabel={t.landing.signIn}
              onClick={() => navigate("/login?role=rescue_team")}
            />
            <RoleCard
              icon={<Shield size={26} />}
              title={t.landing.authorityRole}
              desc={t.landing.authorityRoleDesc}
              actionLabel={t.landing.signIn}
              onClick={() => navigate("/login?role=authority")}
            />
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-4 pb-10">
          <div className="bg-surface border border-border rounded-lg p-4 flex flex-wrap items-center gap-4 justify-center text-sm">
            <span className="text-text-secondary font-medium">{t.landing.trustNote}</span>
            <a href="tel:1078" className="flex items-center gap-1.5 font-semibold text-emergency">
              <Phone size={16} aria-hidden="true" /> 1078
            </a>
            <a href="tel:108" className="flex items-center gap-1.5 font-semibold text-emergency">
              <Phone size={16} aria-hidden="true" /> 108
            </a>
            <a href="tel:100" className="flex items-center gap-1.5 font-semibold text-emergency">
              <Phone size={16} aria-hidden="true" /> 100
            </a>
          </div>
        </section>
      </main>

      <footer className="border-t border-border bg-surface">
        <div className="max-w-5xl mx-auto px-4 py-6 flex flex-wrap gap-4 justify-center text-sm text-text-secondary">
          <span>{t.landing.footerAbout}</span>
          <span>{t.landing.footerData}</span>
          <span>{t.landing.footerAccessibility}</span>
          <span>{t.landing.footerHelplines}</span>
        </div>
      </footer>
    </div>
  );
}

function RoleCard({ icon, title, desc, actionLabel, onClick }) {
  return (
    <div className="bg-surface border-2 border-border rounded-lg p-5 flex flex-col items-center text-center gap-2">
      <div className="text-gov-blue">{icon}</div>
      <h3 className="font-bold text-text-primary">{title}</h3>
      <p className="text-sm text-text-secondary flex-1">{desc}</p>
      <button
        onClick={onClick}
        className="mt-2 min-h-tap px-5 rounded-lg border-2 border-gov-blue text-gov-blue font-semibold text-sm hover:bg-gov-blue-light w-full"
      >
        {actionLabel}
      </button>
    </div>
  );
}
