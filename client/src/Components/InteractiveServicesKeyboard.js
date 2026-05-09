import React, { useState } from "react";
import { motion } from "framer-motion";
import { MapPinned, Users, Sparkles, Compass, Wallet } from "lucide-react";
import omAvatar from "../assets/om.png";
import "./InteractiveServicesKeyboard.css";

const copy = {
  ar: {
    eyebrow: "الكيبورد التفاعلي",
    title: "اضغط لاكتشاف خدمات ريادتك",
    keys: [
      { id: "loc", icon: MapPinned, label: "الموقع", desc: "تقييم الموقع بناءً على البيانات والمؤشرات الفعلية حول النقطة، مع دراسة جدوى مبسطة لمساعدتك على القرار." },
      { id: "competition", icon: Users, label: "المنافسة", desc: "عرض المنافسين القريبين حسب نوع النشاط من بيانات OpenStreetMap." },
      { id: "alt", icon: Compass, label: "البدائل", desc: "اقتراح مناطق بديلة داخل المدينة بناءً على النشاط والمنافسة." },
      { id: "assistant", icon: Sparkles, label: "مساعد ذكي", desc: "مساعد ذكي يقرأ نتائجك ويلخّص الفرص والتنبيهات بلغة بسيطة." },
      { id: "funding", icon: Wallet, label: "التمويل", desc: "خيارات تمويلية تناسب حجم مشروعك مع نظرة سريعة على المتطلبات." },
    ],
  },
  en: {
    eyebrow: "Interactive keyboard",
    title: "Press to Discover RiadaTech Services",
    keys: [
      { id: "loc", icon: MapPinned, label: "Location", desc: "Evaluate the spot using real-world data and signals — includes a simple feasibility read for the chosen point." },
      { id: "competition", icon: Users, label: "Competition", desc: "See nearby competitors by category from OpenStreetMap data." },
      { id: "alt", icon: Compass, label: "Alternatives", desc: "Get alternative areas inside the city based on activity and competition." },
      { id: "assistant", icon: Sparkles, label: "Smart Assistant", desc: "An AI helper that reads your results and summarises opportunities and alerts in plain language." },
      { id: "funding", icon: Wallet, label: "Funding", desc: "Funding options that match your project size with a quick look at the requirements." },
    ],
  },
};

function InteractiveServicesKeyboard({ locale = "ar" }) {
  const isArabic = locale === "ar";
  const t = copy[locale] || copy.ar;
  const [activeId, setActiveId] = useState(t.keys[0].id);

  const active = t.keys.find((k) => k.id === activeId) || t.keys[0];
  const ActiveIcon = active.icon;

  return (
    <section
      className="rt-keyboard"
      id="services-keyboard"
      dir={isArabic ? "rtl" : "ltr"}
      data-testid="keyboard-section"
    >
      <div className="rt-keyboard__bg" aria-hidden="true" />

      <div className="rt-keyboard__inner">
        <motion.div
          className="rt-keyboard__head"
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="rt-keyboard__eyebrow">{t.eyebrow}</span>
          <h2 className="rt-keyboard__title" data-lang={locale}>
            {t.title}
          </h2>
        </motion.div>

        <div className="rt-keyboard__stage">
          {/* Character guide on the side */}
          <motion.div
            className="rt-keyboard__guide"
            initial={{ opacity: 0, x: isArabic ? 60 : -60, y: 30 }}
            whileInView={{ opacity: 1, x: 0, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            aria-hidden="true"
          >
            <div className="rt-keyboard__guide-glow" />
            <img
              src={omAvatar}
              alt=""
              className="rt-keyboard__guide-img"
              draggable={false}
            />
          </motion.div>

          {/* Description panel */}
          <motion.div
            key={active.id}
            className="rt-keyboard__panel"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            data-testid="keyboard-active-panel"
          >
            <div className="rt-keyboard__panel-icon">
              <ActiveIcon size={28} strokeWidth={2.2} />
            </div>
            <h3 className="rt-keyboard__panel-title" data-lang={locale}>
              {active.label}
            </h3>
            <p className="rt-keyboard__panel-desc" data-lang={locale}>
              {active.desc}
            </p>
          </motion.div>

          {/* Keyboard */}
          <div className="rt-keyboard__board" dir="ltr">
            <div className="rt-keyboard__board-frame">
              <div className="rt-keyboard__keys">
                {t.keys.map((k) => {
                  const Icon = k.icon;
                  const isActive = k.id === activeId;
                  return (
                    <button
                      key={k.id}
                      type="button"
                      className={`rt-keyboard__key ${isActive ? "is-active" : ""}`}
                      onClick={() => setActiveId(k.id)}
                      onMouseEnter={() => setActiveId(k.id)}
                      data-testid={`keyboard-key-${k.id}`}
                    >
                      <span className="rt-keyboard__key-top">
                        <Icon size={20} strokeWidth={2.2} />
                      </span>
                      <span className="rt-keyboard__key-label" data-lang={locale}>
                        {k.label}
                      </span>
                    </button>
                  );
                })}
              </div>
              <div className="rt-keyboard__board-glow" aria-hidden="true" />
            </div>
            <div className="rt-keyboard__board-base" aria-hidden="true" />
          </div>
        </div>
      </div>
    </section>
  );
}

export default InteractiveServicesKeyboard;
