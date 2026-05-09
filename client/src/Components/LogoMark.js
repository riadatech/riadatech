import React from "react";

import "./LogoMark.css";

function LogoMark({
  locale = "ar",
  className = "",
  arabicPrimary = "رياد",
  arabicAccent = "تك",
  englishPrimary = "riad",
  englishAccent = "Tach",
}) {
  const isArabic = locale === "ar";
  const primaryText = isArabic ? arabicPrimary : englishPrimary;
  const accentText = isArabic ? arabicAccent : englishAccent;
  const ariaLabel = `${primaryText}${accentText}`;

  return (
    <span
      className={`rt-logo-mark ${isArabic ? "is-ar" : "is-en"} ${className}`.trim()}
      aria-label={ariaLabel}
    >
      <span className="rt-logo-mark-primary">{primaryText}</span>
      <span className="rt-logo-mark-accent">{accentText}</span>
    </span>
  );
}

export default LogoMark;
