import React from "react";
import { Link } from "react-router-dom";

import LogoMark from "./LogoMark";

function SiteFooter({ locale }) {
  const isArabic = locale === "ar";

  const labels = isArabic
    ? {
        brandTitle: "ريادتك",
        brandSubtitle: "منصة ذكية تساعد رواد الأعمال في عمان على اتخاذ قرارات أفضل عبر التحليل الذكي والخرائط والبيانات المحلية.",
        quickLinks: "روابط سريعة",
        contact: "تواصل معنا",
        home: "الرئيسية",
        map: "تحليل المواقع",
        services: "خدماتنا",
        how: "كيف نساعدك",
        email: "info@riadatach.com",
        country: "سلطنة عمان",
        copyright: "© 2026 RiadaTech. جميع الحقوق محفوظة.",
      }
    : {
        brandTitle: "RiadaTech",
        brandSubtitle:
          "An intelligent platform that helps entrepreneurs in Oman choose stronger business opportunities with map-led analysis and local market signals.",
        quickLinks: "Quick links",
        contact: "Contact",
        home: "Home",
        map: "Map Analysis",
        services: "Services",
        how: "How We Help",
        email: "info@riadatach.com",
        country: "Sultanate of Oman",
        copyright: "© 2026 RiadaTech. All rights reserved.",
      };

  return (
    <>
      <section className="rt-shell-footer-band">
        <div className="rt-shell-footer-grid">
          <div className="rt-shell-footer-brand">
            <LogoMark locale={locale} className="rt-shell-footer-logo" />
            <h2>{labels.brandTitle}</h2>
            <p>{labels.brandSubtitle}</p>
          </div>

          <div className="rt-shell-footer-links">
            <h3>{labels.quickLinks}</h3>
            <Link to="/">{labels.home}</Link>
            <Link to="/map-analysis">{labels.map}</Link>
            <a href="/#services">{labels.services}</a>
            <a href="/#how">{labels.how}</a>
          </div>

          <div className="rt-shell-footer-contact">
            <h3>{labels.contact}</h3>
            <p>{labels.email}</p>
            <p>{labels.country}</p>
          </div>
        </div>
      </section>

      <footer className="rt-shell-footer">{labels.copyright}</footer>
    </>
  );
}

export default SiteFooter;
