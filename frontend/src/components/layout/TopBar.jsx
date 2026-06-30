import { useNavigate } from "react-router-dom";
import { ArrowLeft, Shield } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

export default function TopBar({ title, showBack = false, rightSlot }) {
  const navigate = useNavigate();
  const { language, toggleLanguage, t } = useLanguage();

  return (
    <header className="sticky top-0 z-30 bg-surface border-b border-border">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
        {showBack ? (
          <button
            onClick={() => navigate(-1)}
            aria-label={t.common.back}
            className="flex items-center justify-center min-h-tap min-w-tap rounded-full hover:bg-bg-base -ml-2"
          >
            <ArrowLeft size={22} aria-hidden="true" />
          </button>
        ) : (
          <div className="flex items-center justify-center min-h-tap min-w-tap text-gov-blue">
            <Shield size={26} strokeWidth={2.5} aria-hidden="true" />
          </div>
        )}

        <h1 className="flex-1 text-lg font-bold text-text-primary truncate">
          {title || t.appName}
        </h1>

        {rightSlot}

        <button
          onClick={toggleLanguage}
          aria-label="Toggle language"
          className="min-h-tap px-3 rounded-full border-2 border-gov-blue text-gov-blue font-bold text-sm hover:bg-gov-blue-light"
        >
          {language === "en" ? "हिं" : "EN"}
        </button>
      </div>
    </header>
  );
}
