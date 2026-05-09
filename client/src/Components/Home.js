import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { ArrowUpRight, Sparkles } from "lucide-react";

import omAvatar from "../assets/om.png";
import HomeHero3D from "./HomeHero3D";
import AboutUs from "./AboutUs";
import IdeaLampStage from "./IdeaLampStage";
import InteractiveServicesKeyboard from "./InteractiveServicesKeyboard";
import WhoNeedsRiadaTech from "./WhoNeedsRiadaTech";
import "./Home.css";

function Home({ locale = "ar" }) {
  const isArabic = locale === "ar";
  const pageRef = useRef(null);

  // Scroll-driven progress for the central light "thread"
  const { scrollYProgress } = useScroll({
    target: pageRef,
    offset: ["start start", "end end"],
  });

  const threadHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
  const smoothThread = useSpring(threadHeight, { stiffness: 80, damping: 20 });

  // Track scroll for parallax orbs
  useEffect(() => {
    const root = pageRef.current;
    if (!root) return undefined;
    let raf = 0;
    function tick() {
      const y = window.scrollY;
      root.style.setProperty("--rt-page-scroll", `${y}px`);
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const finalCopy = isArabic
    ? {
        eyebrow: "خطوتك القادمة",
        line1: "كل ما تبقى",
        line2: "خطوة واحدة",
        line3: "نحو قرارك الذكي",
        body: "الخريطة جاهزة، البيانات جاهزة، نحن معك.",
        cta: "ابدأ التحليل الآن",
        whisper: "اضغط، وسنأخذك من هنا.",
        rights: "© ريادتك 2026 — صُنع في سلطنة عُمان",
        contact: "info@riadatach.com",
      }
    : {
        eyebrow: "Your next step",
        line1: "All that's left",
        line2: "is one move",
        line3: "toward your smart decision",
        body: "Map ready. Data ready. We're with you.",
        cta: "Start Analysis Now",
        whisper: "Click, and we'll take it from here.",
        rights: "© RiadaTech 2026 — Made in Oman",
        contact: "info@riadatach.com",
      };

  return (
    <div
      ref={pageRef}
      className="rt-home"
      dir={isArabic ? "rtl" : "ltr"}
      data-testid="home-page"
    >
      {/* Continuous central light "thread" that grows with scroll */}
      <div className="rt-home__thread-track" aria-hidden="true">
        <motion.div
          className="rt-home__thread"
          style={{ height: smoothThread }}
        />
      </div>

      {/* Ambient stars overlay */}
      <div className="rt-home__stars" aria-hidden="true" />

      <HomeHero3D locale={locale} />
      <AboutUs locale={locale} />
      <IdeaLampStage locale={locale} />
      <InteractiveServicesKeyboard locale={locale} />
      <WhoNeedsRiadaTech locale={locale} />

      {/* ======================== Final cinematic closing scene ======================== */}
      <section
        className="rt-finale"
        id="contact"
        data-testid="home-finale"
        dir={isArabic ? "rtl" : "ltr"}
      >
        <div className="rt-finale__aurora" aria-hidden="true" />

        <motion.div
          className="rt-finale__char-wrap"
          initial={{ opacity: 0, y: 60, scale: 0.92 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="rt-finale__char-glow" aria-hidden="true" />
          <img
            src={omAvatar}
            alt=""
            className="rt-finale__char"
            draggable={false}
          />
        </motion.div>

        <div className="rt-finale__inner">
          <motion.span
            className="rt-finale__eyebrow"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Sparkles size={14} />
            {finalCopy.eyebrow}
          </motion.span>

          <h2 className="rt-finale__title" data-lang={locale}>
            <motion.span
              className="rt-finale__title-line"
              initial={{ opacity: 0, y: 28, filter: "blur(8px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
            >
              {finalCopy.line1}
            </motion.span>
            <motion.span
              className="rt-finale__title-line rt-finale__title-line--accent"
              initial={{ opacity: 0, y: 28, filter: "blur(8px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
            >
              {finalCopy.line2}
            </motion.span>
            <motion.span
              className="rt-finale__title-line"
              initial={{ opacity: 0, y: 28, filter: "blur(8px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1], delay: 0.45 }}
            >
              {finalCopy.line3}
            </motion.span>
          </h2>

          <motion.p
            className="rt-finale__body"
            data-lang={locale}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.7, delay: 0.6 }}
          >
            {finalCopy.body}
          </motion.p>

          <motion.div
            className="rt-finale__cta-wrap"
            initial={{ opacity: 0, y: 18, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.75 }}
          >
            <Link
              to="/map-analysis"
              className="rt-finale__cta"
              data-testid="finale-start-analysis"
            >
              <span className="rt-finale__cta-label">{finalCopy.cta}</span>
              <span className="rt-finale__cta-arrow">
                <ArrowUpRight size={20} strokeWidth={2.4} />
              </span>
              <span className="rt-finale__cta-pulse" aria-hidden="true" />
            </Link>
            <span className="rt-finale__whisper" data-lang={locale}>
              {finalCopy.whisper}
            </span>
          </motion.div>
        </div>
      </section>

      {/* Minimal dark footer */}
      <footer className="rt-home-foot">
        <div className="rt-home-foot__inner">
          <span className="rt-home-foot__brand">RiadaTech / ريادتك</span>
          <a href={`mailto:${finalCopy.contact}`} className="rt-home-foot__link">
            {finalCopy.contact}
          </a>
          <span className="rt-home-foot__rights" data-lang={locale}>
            {finalCopy.rights}
          </span>
        </div>
      </footer>
    </div>
  );
}

export default Home;
