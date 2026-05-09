const EARTH_RADIUS_KM = 6371;

function toRadians(degrees) {
  return (Number(degrees) * Math.PI) / 180;
}

export function calculateDistanceKm(lat1, lng1, lat2, lng2) {
  const startLat = Number(lat1);
  const startLng = Number(lng1);
  const endLat = Number(lat2);
  const endLng = Number(lng2);

  if (
    !Number.isFinite(startLat) ||
    !Number.isFinite(startLng) ||
    !Number.isFinite(endLat) ||
    !Number.isFinite(endLng)
  ) {
    return null;
  }

  const deltaLat = toRadians(endLat - startLat);
  const deltaLng = toRadians(endLng - startLng);
  const haversine =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(toRadians(startLat)) *
      Math.cos(toRadians(endLat)) *
      Math.sin(deltaLng / 2) ** 2;

  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
}
