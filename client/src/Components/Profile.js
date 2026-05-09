import React, { useState } from "react";
import { useSelector } from "react-redux";
import { Link, useLocation } from "react-router-dom";
import { Mail, MapPinned, RefreshCw, UserRound } from "lucide-react";

import SiteFooter from "./SiteFooter.jsx";
import "./ProfilePage.css";
import {
  buildCompactLocationLabel,
  clearStoredDetectedLocation,
  fetchDetectedLocation,
  LOCATION_ERROR_MESSAGE,
  readStoredDetectedLocation,
} from "../utils/locationService";

const copy = {
  ar: {
    title: "\u0627\u0644\u0645\u0644\u0641 \u0627\u0644\u0634\u062E\u0635\u064A",
    subtitle:
      "\u0645\u0639\u0644\u0648\u0645\u0627\u062A \u0627\u0644\u062D\u0633\u0627\u0628 \u0648\u0623\u062F\u0642 \u0645\u0648\u0642\u0639 \u062D\u0627\u0644\u064A \u0645\u062A\u0627\u062D \u0644\u0643.",
    name: "\u0627\u0644\u0627\u0633\u0645",
    email: "\u0627\u0644\u0628\u0631\u064A\u062F \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A",
    locationTitle: "\u0645\u0639\u0644\u0648\u0645\u0627\u062A \u0627\u0644\u0645\u0648\u0642\u0639",
    locationEmpty:
      "\u0644\u0627 \u062A\u062A\u0648\u0641\u0631 \u0645\u0639\u0644\u0648\u0645\u0627\u062A \u0645\u0648\u0642\u0639 \u062D\u0627\u0644\u064A\u064B\u0627. \u064A\u0645\u0643\u0646\u0643 \u062A\u062D\u062F\u064A\u062B\u0647\u0627 \u0645\u0646 \u0647\u0630\u0647 \u0627\u0644\u0635\u0641\u062D\u0629 \u0623\u0648 \u0645\u0646 \u0635\u0641\u062D\u0629 \u0627\u0644\u062E\u0631\u064A\u0637\u0629.",
    refresh: "\u062A\u062D\u062F\u064A\u062B \u0627\u0644\u0645\u0648\u0642\u0639",
    loginRequired:
      "\u064A\u062C\u0628 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644 \u0623\u0648\u0644\u064B\u0627 \u0644\u0639\u0631\u0636 \u0627\u0644\u0645\u0644\u0641 \u0627\u0644\u0634\u062E\u0635\u064A.",
    backToLogin: "\u0627\u0644\u0627\u0646\u062A\u0642\u0627\u0644 \u0625\u0644\u0649 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644",
    area: "\u0627\u0644\u0645\u0646\u0637\u0642\u0629",
    governorate: "\u0627\u0644\u0645\u062D\u0627\u0641\u0638\u0629",
    wilayat: "\u0627\u0644\u0648\u0644\u0627\u064A\u0629",
    country: "\u0627\u0644\u062F\u0648\u0644\u0629",
    sourceBrowser: "\u0645\u0635\u062F\u0631 \u0627\u0644\u0645\u0648\u0642\u0639: \u0627\u0644\u0645\u062A\u0635\u0641\u062D",
  },
  en: {
    title: "Profile",
    subtitle: "Your account details and the most accurate current location available.",
    name: "Name",
    email: "Email",
    locationTitle: "Location information",
    locationEmpty:
      "Location details are not available yet. You can refresh them here or from the map page.",
    refresh: "Refresh location",
    loginRequired: "You need to sign in before viewing the profile page.",
    backToLogin: "Go to login",
    area: "Area",
    governorate: "Governorate",
    wilayat: "Wilayat",
    country: "Country",
    sourceBrowser: "Source: Browser geolocation",
  },
};

function Profile({ locale = "ar" }) {
  const location = useLocation();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const [detectedLocation, setDetectedLocation] = useState(() => readStoredDetectedLocation());
  const [locationError, setLocationError] = useState("");
  const [loadingLocation, setLoadingLocation] = useState(false);

  const text = copy[locale];
  const direction = locale === "ar" ? "rtl" : "ltr";

  async function handleRefreshLocation() {
    console.log("Update Location button clicked");
    setLoadingLocation(true);
    setLocationError("");
    setDetectedLocation(null);
    clearStoredDetectedLocation();

    try {
      const nextLocation = await fetchDetectedLocation();
      setDetectedLocation(nextLocation);
    } catch (error) {
      setDetectedLocation(null);
      clearStoredDetectedLocation();
      setLocationError(LOCATION_ERROR_MESSAGE);
    } finally {
      setLoadingLocation(false);
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="rt-profile-page" dir={direction}>
        <main className="rt-profile-main">
          <div className="rt-profile-shell">
            <div className="rt-profile-card">
              <h1 className="rt-profile-title">{text.title}</h1>
              <p className="rt-profile-empty" style={{ marginTop: 12 }}>
                {text.loginRequired}
              </p>
              <div className="rt-profile-actions">
                <Link to="/login" state={{ from: location }} className="rt-auth-link">
                  {text.backToLogin}
                </Link>
              </div>
            </div>
          </div>
        </main>
        <SiteFooter locale={locale} />
      </div>
    );
  }

  return (
    <div className="rt-profile-page" dir={direction}>
      <main className="rt-profile-main">
        <div className="rt-profile-shell">
          <section className="rt-profile-card">
            <div className="rt-profile-head">
              <div>
                <h1 className="rt-profile-title">{text.title}</h1>
                <p className="rt-profile-subtitle">{text.subtitle}</p>
              </div>
            </div>

            <div className="rt-profile-grid">
              <article className="rt-profile-info-card">
                <div className="rt-profile-info-head">
                  <UserRound size={18} />
                  <h3>{text.name}</h3>
                </div>
                <p className="rt-profile-info-value">{user?.name || "--"}</p>
              </article>

              <article className="rt-profile-info-card">
                <div className="rt-profile-info-head">
                  <Mail size={18} />
                  <h3>{text.email}</h3>
                </div>
                <p className="rt-profile-info-value">{user?.email || "--"}</p>
              </article>
            </div>

            <section className="rt-profile-location-card">
              <div className="rt-profile-location-head">
                <MapPinned size={18} />
                <h3>{text.locationTitle}</h3>
              </div>

              {locationError ? <div className="rt-auth-submit-error">{locationError}</div> : null}

              {detectedLocation ? (
                <>
                  <div className="rt-profile-location-grid">
                    <div className="rt-profile-location-item">
                      <span>{text.area}</span>
                      <strong>{detectedLocation.area || detectedLocation.neighborhood || "--"}</strong>
                    </div>
                    <div className="rt-profile-location-item">
                      <span>{text.governorate}</span>
                      <strong>{detectedLocation.governorate || detectedLocation.region || "--"}</strong>
                    </div>
                    <div className="rt-profile-location-item">
                      <span>{text.wilayat}</span>
                      <strong>{detectedLocation.wilayat || detectedLocation.city || "--"}</strong>
                    </div>
                    <div className="rt-profile-location-item">
                      <span>{text.country}</span>
                      <strong>{detectedLocation.country || "--"}</strong>
                    </div>
                  </div>

                  <div className="rt-profile-location-meta">
                    <span className="rt-profile-location-pill">
                      {buildCompactLocationLabel(detectedLocation) || detectedLocation.formattedAddress || "--"}
                    </span>
                    <span className="rt-profile-location-pill">{text.sourceBrowser}</span>
                  </div>
                </>
              ) : (
                <p className="rt-profile-empty">{text.locationEmpty}</p>
              )}

              <div className="rt-profile-actions">
                <button
                  type="button"
                  className="rt-profile-secondary-button"
                  onClick={handleRefreshLocation}
                  disabled={loadingLocation}
                >
                  <RefreshCw size={16} className={loadingLocation ? "rt-spin" : ""} />
                  {text.refresh}
                </button>
              </div>
            </section>
          </section>
        </div>
      </main>
      <SiteFooter locale={locale} />
    </div>
  );
}

export default Profile;
