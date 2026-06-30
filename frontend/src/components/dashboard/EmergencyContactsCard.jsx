import { Phone } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

export default function EmergencyContactsCard({ contacts = [] }) {
  const { t } = useLanguage();

  return (
    <section
      aria-labelledby="emergency-contacts-heading"
      className="bg-surface border-2 border-emergency-light rounded-lg p-4"
    >
      <h2 id="emergency-contacts-heading" className="text-base font-bold text-text-primary mb-3">
        {t.dashboard.emergencyContacts}
      </h2>
      <ul className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {contacts.map((contact) => (
          <li key={contact.id}>
            <a
              href={`tel:${contact.phone_number}`}
              className="flex items-center gap-2 min-h-tap px-3 py-2 rounded-lg bg-bg-base hover:bg-emergency-light transition-colors"
            >
              <Phone size={18} className="text-emergency flex-shrink-0" aria-hidden="true" />
              <span className="flex flex-col leading-tight">
                <span className="text-sm font-semibold text-text-primary">{contact.label}</span>
                <span className="text-sm text-text-secondary">{contact.phone_number}</span>
              </span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
