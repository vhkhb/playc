/**
 * Haversine formula – calculates the great-circle distance (in kilometres)
 * between two points specified by latitude / longitude in decimal degrees.
 */
export function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const EARTH_RADIUS_KM = 6371;

  const toRadians = (deg: number): number => (deg * Math.PI) / 180;

  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_KM * c;
}

/**
 * Filter an array of items that have `latitude` / `longitude` properties,
 * returning only those within `radiusKm` of the reference point.
 * Each returned item is augmented with a `distance` property (in km).
 */
export function filterByDistance<
  T extends { latitude?: number | null; longitude?: number | null }
>(
  items: T[],
  refLat: number,
  refLon: number,
  radiusKm: number
): (T & { distance: number })[] {
  return items
    .filter(
      (item): item is T & { latitude: number; longitude: number } =>
        item.latitude !== null &&
        item.latitude !== undefined &&
        item.longitude !== null &&
        item.longitude !== undefined
    )
    .map((item) => ({
      ...item,
      distance: Math.round(
        haversineDistance(refLat, refLon, item.latitude, item.longitude) * 100
      ) / 100,
    }))
    .filter((item) => item.distance <= radiusKm)
    .sort((a, b) => a.distance - b.distance);
}
