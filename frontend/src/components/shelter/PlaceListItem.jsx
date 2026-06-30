import { Navigation, Phone } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import { formatDistance } from "../../utils/geo";

const CAPACITY_STYLES = {
  open: "bg-safe-light text-safe",
  limited: "bg-warning-light text-warning",
  full: "bg-emergency-light text-emergency-dark",
};

const TYPE_LABEL_KEY = { shelter: "shelters", hospital: "hospitals", police_station: "police" };

export default function PlaceListItem({ place, distanceKm }) {
  const { t } = useLanguage();

  const directionsUrl = `https://www.openstreetmap.org/directions?from=&to=${place.latitude}%2C${place.longitude}`;

  return (
    <div className="bg-surface border border-border rounded-lg p-4 flex flex-col gap-2">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-bold text-text-primary leading-snug">{place.name}</h3>
          <p className="text-sm text-text-secondary">
            {t.shelter[TYPE_LABEL_KEY[place.place_type]]}
            {distanceKm != null && ` · ${formatDistance(distanceKm)} ${t.shelter.distanceAway}`}
          </p>
          {place.address && <p className="text-sm text-text-secondary">{place.address}</p>}
        </div>
        {place.capacity_status && (
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${CAPACITY_STYLES[place.capacity_status]}`}>
            {t.shelter[`capacity${place.capacity_status[0].toUpperCase()}${place.capacity_status.slice(1)}`]}
            {place.capacity_total ? ` · ${place.capacity_occupied}/${place.capacity_total}` : ""}
          </span>
        )}
      </div>

      <div className="flex gap-2 mt-1">
        <a
          href={directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-2 min-h-tap bg-gov-blue hover:bg-gov-blue-dark text-white font-semibold rounded-lg text-sm"
        >
          <Navigation size={16} aria-hidden="true" />
          {t.shelter.directions}
        </a>
        {place.phone && (
          <a
            href={`tel:${place.phone}`}
            aria-label={`Call ${place.name}`}
            className="flex items-center justify-center min-h-tap min-w-tap border-2 border-border rounded-lg text-text-primary"
          >
            <Phone size={18} aria-hidden="true" />
          </a>
        )}
      </div>
    </div>
  );
}
