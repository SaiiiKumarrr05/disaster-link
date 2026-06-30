import { NavLink } from "react-router-dom";
import { Home, MapPin, MessageCircle, Menu } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

export default function BottomNav() {
  const { t } = useLanguage();

  const navItemClass = ({ isActive }) =>
    `flex flex-col items-center justify-center gap-1 flex-1 py-2 min-h-tap transition-colors ${
      isActive ? "text-gov-blue" : "text-text-secondary"
    }`;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-surface border-t border-border flex md:hidden"
      aria-label="Primary navigation"
    >
      <NavLink to="/dashboard" className={navItemClass} end>
        <Home size={22} aria-hidden="true" />
        <span className="text-xs font-medium">{t.nav.home}</span>
      </NavLink>
      <NavLink to="/shelter-finder" className={navItemClass}>
        <MapPin size={22} aria-hidden="true" />
        <span className="text-xs font-medium">{t.nav.shelter}</span>
      </NavLink>
      <NavLink to="/assistant" className={navItemClass}>
        <MessageCircle size={22} aria-hidden="true" />
        <span className="text-xs font-medium">{t.nav.assistant}</span>
      </NavLink>
      <NavLink to="/menu" className={navItemClass}>
        <Menu size={22} aria-hidden="true" />
        <span className="text-xs font-medium">{t.nav.menu}</span>
      </NavLink>
    </nav>
  );
}
