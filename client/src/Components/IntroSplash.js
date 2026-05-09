import React, { useEffect, useState } from "react";

import LogoMark from "./LogoMark";
import "./IntroSplash.css";

const LOGO_ENTER_DURATION_MS = 700;
const LOGO_HOLD_DURATION_MS = 900;
const EXPLODE_DELAY_MS = LOGO_ENTER_DURATION_MS + LOGO_HOLD_DURATION_MS;
const EXPLODE_DURATION_MS = 1100;

function getIntroLocale() {
  if (typeof window === "undefined") {
    return "ar";
  }

  const browserLanguage = window.navigator?.language?.toLowerCase() || "";
  return browserLanguage.startsWith("ar") ? "ar" : "en";
}

function IntroSplash() {
  const [phase, setPhase] = useState("idle");
  const [isMounted, setIsMounted] = useState(true);
  const [locale] = useState(getIntroLocale);

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    setPhase("entering");

    const exitTimer = window.setTimeout(() => {
      setPhase("exiting");
    }, EXPLODE_DELAY_MS);

    const removeTimer = window.setTimeout(() => {
      setIsMounted(false);
    }, EXPLODE_DELAY_MS + EXPLODE_DURATION_MS);

    return () => {
      window.clearTimeout(exitTimer);
      window.clearTimeout(removeTimer);
    };
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <div
      className={`rt-intro-splash ${
        phase === "exiting" ? "is-exiting" : "is-entering"
      }`}
      aria-hidden="true"
    >
      <LogoMark
        locale={locale}
        className="rt-intro-splash-logo"
        englishPrimary="riada"
        englishAccent="Tach"
      />
    </div>
  );
}

export default IntroSplash;
