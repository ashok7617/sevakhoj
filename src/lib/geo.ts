/** Geospatial helpers usable on both server and client (no DB, no server-only). */

export type LatLng = { lat: number; lng: number };

const R_KM = 6371; // mean Earth radius

const toRad = (d: number) => (d * Math.PI) / 180;

/** Great-circle distance in km. Used for the offline (no-PostGIS) fallback. */
export function haversineKm(a: LatLng, b: LatLng): number {
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R_KM * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** True if a finite lat/lng falls within India's rough bounding box. */
export function isValidIndiaLatLng(lat: number, lng: number): boolean {
  return (
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat >= 6 &&
    lat <= 37.5 &&
    lng >= 68 &&
    lng <= 97.5
  );
}
