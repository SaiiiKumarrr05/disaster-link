import { useState, useCallback } from "react";

// Default fallback: Ernakulam, Kerala — matches our seeded demo data so the
// shelter finder and SOS flow still show something realistic if GPS is denied.
const FALLBACK_LOCATION = { latitude: 9.9816, longitude: 76.2999 };

export function useGeolocation() {
  const [location, setLocation] = useState(null);
  const [status, setStatus] = useState("idle"); // idle | locating | success | denied | error
  const [usedFallback, setUsedFallback] = useState(false);

  const requestLocation = useCallback(() => {
    return new Promise((resolve) => {
      if (!("geolocation" in navigator)) {
        setLocation(FALLBACK_LOCATION);
        setUsedFallback(true);
        setStatus("error");
        resolve(FALLBACK_LOCATION);
        return;
      }

      setStatus("locating");
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = { latitude: position.coords.latitude, longitude: position.coords.longitude };
          setLocation(coords);
          setUsedFallback(false);
          setStatus("success");
          resolve(coords);
        },
        () => {
          setLocation(FALLBACK_LOCATION);
          setUsedFallback(true);
          setStatus("denied");
          resolve(FALLBACK_LOCATION);
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 30000 }
      );
    });
  }, []);

  return { location, status, usedFallback, requestLocation };
}
