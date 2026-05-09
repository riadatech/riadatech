import React from "react";
import { LocateFixed, MapPinned, RefreshCw } from "lucide-react";

import {
  buildCompactLocationLabel,
  LOCATION_ERROR_MESSAGE,
  REVERSE_GEOCODE_WARNING_MESSAGE,
} from "../utils/locationService";

const copy = {
  ar: {
    title: "خدمة تحديد الموقع الحالية",
    description:
      "يتم استخدام موقع المتصفح لاستخراج المنطقة والمحافظة والولاية والدولة من الإحداثيات الحالية.",
    loading: "جارٍ تحديد موقعك الحالي...",
    refresh: "تحديث الموقع",
    useLocation: "استخدام هذا الموقع",
    applied: "تم استخدام الموقع المكتشف للمساعدة في تعبئة التحليل.",
    unavailable: LOCATION_ERROR_MESSAGE,
    area: "المنطقة",
    governorate: "المحافظة",
    wilayat: "الولاية",
    country: "الدولة",
    sourceBrowser: "مصدر الموقع: المتصفح",
    notAvailable: "غير متاح",
    coordinatesOnlyMessage: REVERSE_GEOCODE_WARNING_MESSAGE,
  },
  en: {
    title: "Current location service",
    description:
      "Browser geolocation is used to convert the current coordinates into area, governorate, wilayat, and country when possible.",
    loading: "Detecting your current location...",
    refresh: "Refresh location",
    useLocation: "Use this location",
    applied: "The detected location has been applied to assist the analysis flow.",
    unavailable: LOCATION_ERROR_MESSAGE,
    area: "Area",
    governorate: "Governorate",
    wilayat: "Wilayat",
    country: "Country",
    sourceBrowser: "Source: Browser geolocation",
    notAvailable: "Not available",
    coordinatesOnlyMessage: REVERSE_GEOCODE_WARNING_MESSAGE,
  },
};

function getDetectedLocationLabel(detectedLocation) {
  return buildCompactLocationLabel(detectedLocation) || detectedLocation?.formattedAddress || "";
}

function getCoordinatesLabel(detectedLocation) {
  if (
    typeof detectedLocation?.coordinates?.lat !== "number" ||
    typeof detectedLocation?.coordinates?.lng !== "number"
  ) {
    return "";
  }

  return `${detectedLocation.coordinates.lat.toFixed(5)}, ${detectedLocation.coordinates.lng.toFixed(
    5
  )}`;
}

function LocationInfoBox({
  locale,
  detectedLocation,
  loading,
  error,
  applied,
  onRefresh,
  onApply,
}) {
  const text = copy[locale];

  return (
    <div className="rt-map-location-box">
      <div className="rt-map-location-box-head">
        <div>
          <span className="rt-map-badge rt-map-badge-inline">
            <LocateFixed size={14} />
            {text.title}
          </span>
          <p className="rt-map-location-box-text">{text.description}</p>
        </div>
        <button
          type="button"
          className="rt-map-button-secondary rt-map-button-secondary-compact"
          onClick={onRefresh}
          disabled={loading}
        >
          <RefreshCw size={16} className={loading ? "rt-spin" : ""} />
          {text.refresh}
        </button>
      </div>

      {loading ? <div className="rt-map-status-banner">{text.loading}</div> : null}
      {error ? <div className="rt-map-error-banner">{error || text.unavailable}</div> : null}

      {detectedLocation ? (
        <>
          {detectedLocation.reverseGeocodeMessage ? (
            <div className="rt-map-status-banner">
              {detectedLocation.reverseGeocodeMessage || text.coordinatesOnlyMessage}
            </div>
          ) : null}

          <div className="rt-map-location-grid">
            <div className="rt-map-location-item">
              <span>{text.country}</span>
              <strong>{detectedLocation.country || "--"}</strong>
            </div>
            <div className="rt-map-location-item">
              <span>{text.governorate}</span>
              <strong>{detectedLocation.governorate || detectedLocation.region || "--"}</strong>
            </div>
            <div className="rt-map-location-item">
              <span>{text.wilayat}</span>
              <strong>{detectedLocation.wilayat || detectedLocation.city || "--"}</strong>
            </div>
            <div className="rt-map-location-item">
              <span>{text.area}</span>
              <strong>{detectedLocation.area || detectedLocation.neighborhood || "--"}</strong>
            </div>
          </div>

          <div className="rt-map-location-actions">
            <div>
              <div className="rt-map-location-summary">
                <MapPinned size={16} />
                <span>
                  {getDetectedLocationLabel(detectedLocation) ||
                    getCoordinatesLabel(detectedLocation) ||
                    text.notAvailable}
                </span>
              </div>
              <div className="rt-map-location-meta">
                <span className="rt-map-location-pill">{text.sourceBrowser}</span>
              </div>
            </div>
            <button
              type="button"
              className="rt-map-button-secondary rt-map-button-secondary-compact"
              onClick={onApply}
              disabled={applied}
            >
              <LocateFixed size={16} />
              {text.useLocation}
            </button>
          </div>

          {applied ? <div className="rt-map-save-message">{text.applied}</div> : null}
        </>
      ) : null}
    </div>
  );
}

export function findMatchingCity(detectedLocation, cityOptions) {
  const candidates = [
    detectedLocation?.wilayat,
    detectedLocation?.city,
    detectedLocation?.governorate,
    detectedLocation?.region,
  ]
    .map((value) => String(value || "").trim().toLowerCase())
    .filter(Boolean);

  return (
    cityOptions.find((option) =>
      [option.value, option.en, option.ar].some((value) =>
        candidates.includes(String(value || "").trim().toLowerCase())
      )
    ) || null
  );
}

export function getDetectedLocationLabelForMap(detectedLocation) {
  return getDetectedLocationLabel(detectedLocation);
}

export default LocationInfoBox;
