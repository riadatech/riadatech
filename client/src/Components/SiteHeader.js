import React, { useState } from "react";
import { Menu, X } from "lucide-react";
import { Link, NavLink, useLocation } from "react-router-dom";

import HomeAccountMenu from "./HomeAccountMenu";
import LogoMark from "./LogoMark";
import ThemeToggleButton from "./ThemeToggleButton";
import "./SiteHeader.css";

function SiteHeader({ locale = "ar", setLocale, showCta = true }) {
  const location = useLocation();
  const [isNavOpen, setIsNavOpen] = useState(false);
  const isArabic = locale === "ar";

  const labels = isArabic
    ? {
        home: "الرئيسية",
        map: "تحليل المواقع",
        assistant: "مساعد ذكي",
        funding: "التمويل",
        services: "خدماتنا",
        contact: "تواصل معنا",
        cta: "ابدأ التحليل",
        language: "EN",
        openMenu: "فتح القائمة",
        closeMenu: "إغلاق القائمة",
      }
    : {
        home: "Home",
        map: "Map Analysis",
        assistant: "Smart Assistant",
        funding: "Funding",
        services: "Services",
        contact: "Contact",
        cta: "Start Analysis",
        language: "AR",
        openMenu: "Open menu",
        closeMenu: "Close menu",
      };

  function handleNavClose() {
    setIsNavOpen(false);
  }

  function getNavClass({ isActive }) {
    return `rt-shell-nav-link${isActive ? " active" : ""}`;
  }

  return (
    <header className="rt-shell-header" data-locale={locale}>
      <div className="rt-shell-header-inner" dir={isArabic ? "rtl" : "ltr"}>
        <Link
          to="/"
          className="rt-shell-brand"
          aria-label="RiadaTach Home"
          onClick={handleNavClose}
        >
          <LogoMark locale={locale} className="rt-shell-logo" />
        </Link>

        <button
          type="button"
          className="rt-shell-menu-toggle"
          aria-label={isNavOpen ? labels.closeMenu : labels.openMenu}
          aria-expanded={isNavOpen}
          onClick={() => setIsNavOpen((current) => !current)}
        >
          {isNavOpen ? <X size={18} /> : <Menu size={18} />}
        </button>

        <nav className={`rt-shell-nav${isNavOpen ? " is-open" : ""}`} aria-label="Primary">
          <NavLink to="/" end className={getNavClass} onClick={handleNavClose}>
            {labels.home}
          </NavLink>
          <NavLink to="/map-analysis" className={getNavClass} onClick={handleNavClose}>
            {labels.map}
          </NavLink>
          <NavLink to="/assistant" className={getNavClass} onClick={handleNavClose}>
            {labels.assistant}
          </NavLink>
          <NavLink to="/funding" className={getNavClass} onClick={handleNavClose}>
            {labels.funding}
          </NavLink>
          <a
            href="/#services-keyboard"
            className={`rt-shell-nav-link${
              location.pathname === "/" && location.hash === "#services-keyboard" ? " active" : ""
            }`}
            onClick={handleNavClose}
          >
            {labels.services}
          </a>
          <a
            href="/#contact"
            className={`rt-shell-nav-link${
              location.pathname === "/" && location.hash === "#contact" ? " active" : ""
            }`}
            onClick={handleNavClose}
          >
            {labels.contact}
          </a>
        </nav>

        <div className={`rt-shell-actions${isNavOpen ? " is-open" : ""}`}>
          <HomeAccountMenu />
          <ThemeToggleButton className="rt-shell-theme-toggle" locale={locale} />
          <button
            type="button"
            className="rt-shell-language-toggle"
            onClick={() => setLocale?.(isArabic ? "en" : "ar")}
          >
            {labels.language}
          </button>
          {showCta ? (
            <Link to="/map-analysis" className="rt-shell-cta" onClick={handleNavClose}>
              {labels.cta}
            </Link>
          ) : null}
        </div>
      </div>
    </header>
  );
}

export default SiteHeader;
