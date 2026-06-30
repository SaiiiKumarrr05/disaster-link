import { useEffect, useState, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { List, Map as MapIcon } from "lucide-react";
import TopBar from "../components/layout/TopBar";
import PlaceListItem from "../components/shelter/PlaceListItem";
import { shelterIcon, hospitalIcon, policeIcon, userLocationIcon, iconForPlaceType } from "../components/shelter/mapIcons";
import { placesApi } from "../services/api";
import { useLanguage } from "../context/LanguageContext";
import { useGeolocation } from "../hooks/useGeolocation";
import { haversineKm, formatDistance } from "../utils/geo";

const FILTERS = [
  { key: "shelter", labelKey: "shelters", icon: shelterIcon },
  { key: "hospital", labelKey: "hospitals", icon: hospitalIcon },
  { key: "police_station", labelKey: "police", icon: policeIcon },
];

function RecenterOnLocate({ location }) {
  const map = useMap();
  useEffect(() => {
    if (location) map.setView([location.latitude, location.longitude], 14);
  }, [location, map]);
  return null;
}

export default function ShelterFinderPage() {
  const { t } = useLanguage();
  const { location, status, requestLocation } = useGeolocation();
  const [activeFilters, setActiveFilters] = useState(["shelter"]);
  const [places, setPlaces] = useState([]);
  const [view, setView] = useState("map"); // 'map' | 'list'
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  useEffect(() => {
    if (!location) return;
    setLoading(true);
    Promise.all(
      activeFilters.map((placeType) =>
        placesApi.findNearby({ lat: location.latitude, lng: location.longitude, placeType, radiusKm: 25 })
      )
    )
      .then((results) => setPlaces(results.flat()))
      .catch(() => setPlaces([]))
      .finally(() => setLoading(false));
  }, [location, activeFilters]);

  const placesWithDistance = useMemo(() => {
    if (!location) return places.map((p) => ({ place: p, distanceKm: null }));
    return places
      .map((p) => ({ place: p, distanceKm: haversineKm(location.latitude, location.longitude, p.latitude, p.longitude) }))
      .sort((a, b) => a.distanceKm - b.distanceKm);
  }, [places, location]);

  const toggleFilter = (key) => {
    setActiveFilters((prev) => (prev.includes(key) ? prev.filter((f) => f !== key) : [...prev, key]));
  };

  const mapCenter = location ? [location.latitude, location.longitude] : [22.9734, 78.6569]; // India centroid fallback

  return (
    <div className="flex flex-col h-screen">
      <TopBar
        title={t.shelter.title}
        showBack
        rightSlot={
          <button
            onClick={() => setView(view === "map" ? "list" : "map")}
            className="flex items-center gap-1.5 min-h-tap px-3 rounded-full border-2 border-gov-blue text-gov-blue font-semibold text-sm"
          >
            {view === "map" ? <List size={18} /> : <MapIcon size={18} />}
            {view === "map" ? t.shelter.listView : t.shelter.mapView}
          </button>
        }
      />

      <div className="px-4 py-3 flex gap-2 overflow-x-auto bg-surface border-b border-border">
        {FILTERS.map((f) => {
          const active = activeFilters.includes(f.key);
          return (
            <button
              key={f.key}
              onClick={() => toggleFilter(f.key)}
              className={`flex-shrink-0 min-h-tap px-4 rounded-full border-2 font-semibold text-sm transition-colors ${
                active ? "bg-gov-blue text-white border-gov-blue" : "bg-surface text-text-primary border-border"
              }`}
              aria-pressed={active}
            >
              {t.shelter[f.labelKey]}
            </button>
          );
        })}
      </div>

      {status === "denied" && (
        <p className="bg-warning-light text-warning text-sm font-medium px-4 py-2 text-center">
          {t.shelter.locationDenied}
        </p>
      )}

      <div className="flex-1 relative">
        {view === "map" ? (
          <MapContainer center={mapCenter} zoom={location ? 14 : 5} style={{ height: "100%", width: "100%" }}>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {location && (
              <>
                <RecenterOnLocate location={location} />
                <Marker position={[location.latitude, location.longitude]} icon={userLocationIcon}>
                  <Popup>{t.shelter.yourLocation}</Popup>
                </Marker>
              </>
            )}
            {placesWithDistance.map(({ place, distanceKm }) => (
              <Marker key={place.id} position={[place.latitude, place.longitude]} icon={iconForPlaceType(place.place_type)}>
                <Popup minWidth={240}>
                  <div className="flex flex-col gap-1">
                    <strong>{place.name}</strong>
                    {distanceKm != null && (
                      <span className="text-sm text-text-secondary">
                        {formatDistance(distanceKm)} {t.shelter.distanceAway}
                      </span>
                    )}
                    <a
                      href={`https://www.openstreetmap.org/directions?from=&to=${place.latitude}%2C${place.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gov-blue font-semibold text-sm mt-1"
                    >
                      {t.shelter.directions} →
                    </a>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        ) : (
          <div className="h-full overflow-y-auto bg-bg-base px-4 py-4 flex flex-col gap-3">
            {status === "locating" && <p className="text-text-secondary text-sm">{t.shelter.locating}</p>}
            {loading && <p className="text-text-secondary text-sm">{t.common.loading}</p>}
            {!loading &&
              placesWithDistance.map(({ place, distanceKm }) => (
                <PlaceListItem key={place.id} place={place} distanceKm={distanceKm} />
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
