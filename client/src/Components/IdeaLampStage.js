import React, { useState } from "react";
import { motion } from "framer-motion";
import { Lightbulb } from "lucide-react";
import omAvatar from "../assets/om.png";
import "./IdeaLampStage.css";

const copy = {
  ar: {
    eyebrow: "من فكرة إلى قرار",
    title: "من فكرة إلى قرار ذكي",
    body:
      "ريادتك يساعدك على تحويل فكرة المشروع إلى قرار مبني على البيانات، من اختيار الموقع إلى فهم المنافسة والفرص.",
    hint: "اضغط على المصباح لتشغيل الفكرة",
  },
  en: {
    eyebrow: "From idea to decision",
    title: "From Idea to Smart Decision",
    body:
      "RiadaTech helps transform a business idea into a data-driven decision, from choosing a location to understanding competition and opportunities.",
    hint: "Click the lamp to ignite the idea",
  },
};

function IdeaLampStage({ locale = "ar" }) {
  const isArabic = locale === "ar";
  const t = copy[locale] || copy.ar;
  const [on, setOn] = useState(false);

  return (
    <section
      className={`rt-lamp ${on ? "is-on" : ""}`}
      id="idea-lamp"
      dir={isArabic ? "rtl" : "ltr"}
      data-testid="idea-lamp-section"
    >
      <div className="rt-lamp__bg" aria-hidden="true" />
      <div className="rt-lamp__spotlight" aria-hidden="true" />

      <div className="rt-lamp__inner">
        <motion.div
          className="rt-lamp__copy"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="rt-lamp__eyebrow">{t.eyebrow}</span>
          <h2 className="rt-lamp__title" data-lang={locale}>
            {t.title}
          </h2>
          <p className="rt-lamp__body" data-lang={locale}>
            {t.body}
          </p>
          <span className="rt-lamp__hint" data-lang={locale}>
            {t.hint}
          </span>
        </motion.div>

        <motion.div
          className="rt-lamp__stage"
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Side lamps that appear when "on" */}
          <div className="rt-lamp__side rt-lamp__side--a" aria-hidden="true">
            <Lightbulb size={28} />
          </div>
          <div className="rt-lamp__side rt-lamp__side--b" aria-hidden="true">
            <Lightbulb size={28} />
          </div>
          <div className="rt-lamp__side rt-lamp__side--c" aria-hidden="true">
            <Lightbulb size={28} />
          </div>

          <div className="rt-lamp__char-wrap">
            <div className="rt-lamp__char-glow" aria-hidden="true" />
            <img src={omAvatar} alt="" className="rt-lamp__char" draggable={false} />
          </div>

          {/* Main interactive lamp orbit above the head */}
          <button
            type="button"
            className="rt-lamp__main"
            onClick={() => setOn((s) => !s)}
            onMouseEnter={() => setOn(true)}
            aria-label={t.hint}
            data-testid="idea-lamp-main-btn"
          >
            <span className="rt-lamp__main-cord" aria-hidden="true" />
            <span className="rt-lamp__main-bulb" aria-hidden="true">
              <Lightbulb size={26} strokeWidth={2.4} />
            </span>
          </button>
        </motion.div>
      </div>
    </section>
  );
}

export default IdeaLampStage;
