import L from "leaflet";

// Custom colored pin icons built as inline SVG data URIs — avoids bundling
// extra image assets and keeps each pin's color tied directly to our design
// tokens (safe green for shelters, gov blue for hospitals, navy for police).
function buildPinIcon(color, label) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="34" height="44" viewBox="0 0 34 44">
      <path d="M17 0C7.6 0 0 7.6 0 17c0 11.6 17 27 17 27s17-15.4 17-27C34 7.6 26.4 0 17 0z" fill="${color}" stroke="#FFFFFF" stroke-width="1.5"/>
      <circle cx="17" cy="17" r="8" fill="#FFFFFF"/>
      <text x="17" y="21" font-size="11" font-weight="700" text-anchor="middle" fill="${color}" font-family="Arial">${label}</text>
    </svg>`;
  return L.icon({
    iconUrl: `data:image/svg+xml;base64,${btoa(svg)}`,
    iconSize: [34, 44],
    iconAnchor: [17, 44],
    popupAnchor: [0, -40],
  });
}

export const shelterIcon = buildPinIcon("#16A34A", "S");
export const hospitalIcon = buildPinIcon("#2563EB", "H");
export const policeIcon = buildPinIcon("#1E293B", "P");

export const userLocationIcon = L.divIcon({
  className: "",
  html: `<div style="width:18px;height:18px;background:#2563EB;border:3px solid white;border-radius:50%;box-shadow:0 0 0 4px rgba(37,99,235,0.3);"></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

export function iconForPlaceType(placeType) {
  if (placeType === "shelter") return shelterIcon;
  if (placeType === "hospital") return hospitalIcon;
  return policeIcon;
}
