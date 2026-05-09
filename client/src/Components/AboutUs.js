import React from "react";
import { motion } from "framer-motion";
import { MapPinned, Sparkles, Wallet } from "lucide-react";
import omAvatar from "../assets/om.png";
import "./AboutUs.css";

const copy = {
  ar: {
    eyebrow: "من نحن",
    title: "من نحن",
    body:
      "نحن طالبات مبدعات من جامعة التقنية والعلوم التطبيقية، نعمل على بناء ريادتك لمساعدة رواد الأعمال والمشاريع الصغيرة والمتوسطة على تحويل أفكارهم إلى قرارات أذكى في اختيار الموقع ودراسة الجدوى.",
    cards: [
      { id: "loc", icon: MapPinned, label: "تحليل المواقع" },
      { id: "assistant", icon: Sparkles, label: "مساعد ذكي" },
      { id: "funding", icon: Wallet, label: "تمويل" },
    ],
  },
  en: {
    eyebrow: "About Us",
    title: "About Us",
    body:
      "We are creative graduation students from UTAS, building RiadaTech to help SMEs turn business ideas into smarter location and feasibility decisions.",
    cards: [
      { id: "loc", icon: MapPinned, label: "Location Analysis" },
      { id: "assistant", icon: Sparkles, label: "Smart Assistant" },
      { id: "funding", icon: Wallet, label: "Funding" },
    ],
  },
};

function AboutUs({ locale = "ar" }) {
  const isArabic = locale === "ar";
  const t = copy[locale] || copy.ar;

  return (
    <section
      className="rt-about"
      id="about"
      dir={isArabic ? "rtl" : "ltr"}
      data-testid="about-section"
    >
      <div className="rt-about__bg" aria-hidden="true" />

      <div className="rt-about__inner">
        <motion.div
          className="rt-about__visual"
          initial={{ opacity: 0, x: isArabic ? 40 : -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="rt-about__halo" aria-hidden="true" />
          <div className="rt-about__ring" aria-hidden="true" />
          <img
            src={omAvatar}
            alt={t.title}
            className="rt-about__char"
            draggable={false}
          />
          <div className="rt-about__chip rt-about__chip--a">
            <span className="rt-about__chip-dot" />
            <span>{isArabic ? "تحليل ذكي" : "Smart insight"}</span>
          </div>
          <div className="rt-about__chip rt-about__chip--b">
            <span className="rt-about__chip-dot" />
            <span>{isArabic ? "بيانات عُمان" : "Oman data"}</span>
          </div>
        </motion.div>

        <motion.div
          className="rt-about__copy"
          initial={{ opacity: 0, x: isArabic ? -40 : 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
        >
          <span className="rt-about__eyebrow">{t.eyebrow}</span>
          <h2 className="rt-about__title" data-lang={locale}>
            {t.title}
          </h2>
          <p className="rt-about__body" data-lang={locale}>
            {t.body}
          </p>

          <div className="rt-about__cards">
            {t.cards.map((c, i) => {
              const Icon = c.icon;
              return (
                <motion.div
                  key={c.id}
                  className="rt-about__card"
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.6 }}
                  transition={{ duration: 0.6, delay: 0.2 + i * 0.1 }}
                  data-testid={`about-card-${c.id}`}
                >
                  <div className="rt-about__card-icon">
                    <Icon size={20} strokeWidth={2.2} />
                  </div>
                  <span>{c.label}</span>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default AboutUs;
