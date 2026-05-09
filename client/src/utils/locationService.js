import { loadGoogleMapsScript } from "../Components/mapAnalysisConfig";

const LOCATION_STORAGE_KEY = "riadatach-detected-location";
const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || "";
const BROWSER_LOCATION_REQUEST_TIMEOUT_MS = 15000;

export const LOCATION_ERROR_MESSAGE =
  "\u062A\u0639\u0630\u0631 \u062C\u0644\u0628 \u0645\u0648\u0642\u0639\u0643 \u0627\u0644\u062D\u0627\u0644\u064A";
export const REVERSE_GEOCODE_WARNING_MESSAGE =
  "\u062A\u0645 \u062A\u062D\u062F\u064A\u062F \u0627\u0644\u0625\u062D\u062F\u0627\u062B\u064A\u0627\u062A\u060C \u0644\u0643\u0646 \u062A\u0639\u0630\u0631 \u0627\u0633\u062A\u062E\u0631\u0627\u062C \u062A\u0641\u0627\u0635\u064A\u0644 \u0627\u0644\u0639\u0646\u0648\u0627\u0646";

function getAddressComponent(components = [], type, valueKey = "long_name") {
  const matchedComponent = components.find((component) => component.types?.includes(type));
  return matchedComponent?.[valueKey] || "";
}

function getFirstAddressComponent(components = [], types = [], valueKey = "long_name") {
  return (
    types
      .map((type) => getAddressComponent(components, type, valueKey))
      .find((value) => String(value || "").trim()) || ""
  );
}

function normalizeLocationName(value) {
  return String(value || "")
    .replace(/^\s*Governorate of\s+/i, "")
    .replace(/^\s*Governorate\s+/i, "")
    .replace(/\s+Governorate\s*$/i, "")
    .replace(/^\s*Wilayat of\s+/i, "")
    .replace(/^\s*Wilayat\s+/i, "")
    .replace(/\s+Wilayat\s*$/i, "")
    .replace(/^\s*\u0645\u062D\u0627\u0641\u0638\u0629\s+/u, "")
    .replace(/^\s*\u0648\u0644\u0627\u064A\u0629\s+/u, "")
    .trim();
}

function isSameLocationName(firstValue, secondValue) {
  return (
    normalizeLocationName(firstValue).toLowerCase() ===
    normalizeLocationName(secondValue).toLowerCase()
  );
}

export function buildCompactLocationLabel(locationData) {
  const labelParts = [
    locationData?.area || locationData?.neighborhood,
    locationData?.wilayat || locationData?.city,
    locationData?.governorate || locationData?.region,
    locationData?.country,
  ].reduce((parts, value) => {
    const normalizedValue = normalizeLocationName(value);

    if (
      normalizedValue &&
      !parts.some((existingPart) => isSameLocationName(existingPart, normalizedValue))
    ) {
      parts.push(normalizedValue);
    }

    return parts;
  }, []);

  return labelParts.join(", ");
}

export function extractLocationHierarchyFromGeocodeResult(geocodeResult) {
  if (!geocodeResult) {
    return null;
  }

  const components = geocodeResult.address_components || [];
  const country = normalizeLocationName(getAddressComponent(components, "country"));
  const governorate = normalizeLocationName(
    getFirstAddressComponent(components, ["administrative_area_level_1"])
  );
  const wilayat = normalizeLocationName(
    getFirstAddressComponent(components, ["locality", "postal_town"])
  );
  const area = normalizeLocationName(
    getFirstAddressComponent(components, ["sublocality", "sublocality_level_1", "neighborhood"])
  );

  const compactLabel = buildCompactLocationLabel({
    area,
    wilayat,
    governorate,
    country,
  });

  return {
    area,
    governorate,
    wilayat,
    city: wilayat || area,
    region: governorate || wilayat || area,
    country,
    neighborhood: area,
    formattedAddress: compactLabel || geocodeResult.formatted_address || "",
    provider: "browser-geolocation",
  };
}

function normalizeLocationData(locationData) {
  if (!locationData) {
    return null;
  }

  const source = locationData.source || "browser";
  const country = locationData.country || "";
  const governorate = locationData.governorate || locationData.region || "";
  const wilayat = locationData.wilayat || locationData.city || "";
  const area = locationData.area || locationData.neighborhood || "";
  const formattedAddress =
    locationData.formattedAddress ||
    buildCompactLocationLabel({
      area,
      wilayat,
      governorate,
      country,
    });

  return {
    ip: "",
    country,
    governorate,
    wilayat,
    area,
    region: locationData.region || governorate || "",
    city: locationData.city || wilayat || area || "",
    neighborhood: locationData.neighborhood || area || "",
    formattedAddress,
    provider: locationData.provider || "browser-geolocation",
    source,
    isApproximate: false,
    fallbackReason: "",
    accuracyMeters:
      typeof locationData.accuracyMeters === "number" ? locationData.accuracyMeters : null,
    reverseGeocodeMessage: locationData.reverseGeocodeMessage || "",
    coordinates: {
      lat:
        typeof locationData.coordinates?.lat === "number" ? locationData.coordinates.lat : null,
      lng:
        typeof locationData.coordinates?.lng === "number" ? locationData.coordinates.lng : null,
    },
    fetchedAt: locationData.fetchedAt || null,
  };
}

function requestCurrentBrowserPosition() {
  if (typeof window === "undefined" || !window.navigator?.geolocation) {
    console.log("GPS error: geolocation not available");
    return Promise.reject(new Error(LOCATION_ERROR_MESSAGE));
  }

  return new Promise((resolve, reject) => {
    window.navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log("GPS success", {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
        resolve(position);
      },
      (error) => {
        console.log("GPS error details", {
          code: error?.code,
          message: error?.message,
        });
      reject(new Error(`GPS error ${error?.code}: ${error?.message}`));
      },
      {
        enableHighAccuracy: true,
        timeout: BROWSER_LOCATION_REQUEST_TIMEOUT_MS,
        maximumAge: 0,
      }
    );
  });
}

async function reverseGeocodeCoordinates(coordinates) {
  if (
    typeof window === "undefined" ||
    !GOOGLE_MAPS_API_KEY ||
    typeof coordinates?.lat !== "number" ||
    typeof coordinates?.lng !== "number"
  ) {
    return null;
  }

  try {
    await loadGoogleMapsScript(GOOGLE_MAPS_API_KEY);
  } catch (error) {
    return null;
  }

  if (!window.google?.maps?.Geocoder) {
    return null;
  }

  console.log("Reverse geocoding started");

  const geocoder = new window.google.maps.Geocoder();

  const geocodeResult = await new Promise((resolve) => {
    geocoder.geocode({ location: coordinates }, (results, status) => {
      console.log("Geocoder status:", status);
      console.log("Geocoder results:", results);

      if (status === "OK" && results?.[0]) {
        resolve(results[0]);
        return;
      }

      resolve(null);
    });
  });

  console.log("Reverse geocoding result", geocodeResult);

  if (!geocodeResult) {
    return null;
  }

  const parsedLocation = extractLocationHierarchyFromGeocodeResult(geocodeResult);
  console.log("Parsed location data", parsedLocation);

  return parsedLocation;
}

export async function fetchDetectedLocation() {
  const fetchedAt = new Date().toISOString();
  const browserPosition = await requestCurrentBrowserPosition();
  const coordinates = {
    lat: Number(browserPosition.coords.latitude),
    lng: Number(browserPosition.coords.longitude),
  };
  const accuracyMeters =
    typeof browserPosition.coords.accuracy === "number"
      ? Math.round(browserPosition.coords.accuracy)
      : null;

  let reverseGeocodedLocation = null;

  try {
    reverseGeocodedLocation = await reverseGeocodeCoordinates(coordinates);
  } catch (error) {
    reverseGeocodedLocation = null;
  }

  const nextLocation = normalizeLocationData({
    country: reverseGeocodedLocation?.country || "",
    governorate: reverseGeocodedLocation?.governorate || "",
    wilayat: reverseGeocodedLocation?.wilayat || "",
    area: reverseGeocodedLocation?.area || "",
    region: reverseGeocodedLocation?.region || "",
    city: reverseGeocodedLocation?.city || "",
    neighborhood: reverseGeocodedLocation?.neighborhood || "",
    formattedAddress:
      reverseGeocodedLocation?.formattedAddress ||
      `${coordinates.lat.toFixed(5)}, ${coordinates.lng.toFixed(5)}`,
    provider: reverseGeocodedLocation?.provider || "browser-geolocation",
    source: "browser",
    accuracyMeters,
    reverseGeocodeMessage:
      reverseGeocodedLocation?.formattedAddress ||
      reverseGeocodedLocation?.area ||
      reverseGeocodedLocation?.governorate ||
      reverseGeocodedLocation?.wilayat ||
      reverseGeocodedLocation?.country
        ? ""
        : REVERSE_GEOCODE_WARNING_MESSAGE,
    coordinates,
    fetchedAt,
  });

  persistDetectedLocation(nextLocation);
  return nextLocation;
}

export function persistDetectedLocation(locationData) {
  if (typeof window === "undefined" || !locationData) {
    return;
  }

  window.localStorage.setItem(
    LOCATION_STORAGE_KEY,
    JSON.stringify({
      ...normalizeLocationData(locationData),
      fetchedAt: locationData.fetchedAt || new Date().toISOString(),
    })
  );
}

export function clearStoredDetectedLocation() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(LOCATION_STORAGE_KEY);
}

export function readStoredDetectedLocation() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const rawValue = window.localStorage.getItem(LOCATION_STORAGE_KEY);
    const parsedLocation = rawValue ? JSON.parse(rawValue) : null;
    const normalizedLocation = normalizeLocationData(parsedLocation);

    if (!normalizedLocation || parsedLocation?.source !== "browser") {
      clearStoredDetectedLocation();
      return null;
    }

    return normalizedLocation;
  } catch (error) {
    clearStoredDetectedLocation();
    return null;
  }
}
