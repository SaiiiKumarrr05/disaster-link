import { createContext, useContext, useState, useMemo } from "react";
import { en } from "../locales/en";
import { hi } from "../locales/hi";

const translations = { en, hi };

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(
    () => window.localStorage?.getItem("disasterlink_lang") || "en"
  );

  const toggleLanguage = () => {
    const next = language === "en" ? "hi" : "en";
    setLanguage(next);
    try {
      window.localStorage?.setItem("disasterlink_lang", next);
    } catch {
      // localStorage unavailable — language choice just won't persist across reloads
    }
    document.documentElement.lang = next;
  };

  const t = useMemo(() => translations[language] || translations.en, [language]);

  const value = { language, setLanguage, toggleLanguage, t };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within a LanguageProvider");
  return ctx;
}
