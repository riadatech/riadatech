import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

import omaniAvatar from "../assets/om.png";
import "./HomeHero3D.css";

const heroCopy = {
  ar: {
    // In RTL the visual reading is right→left, so "right of character" = "رياد", "left" = "تك"
    rightWord: "رياد",
    leftWord: "تك",
    primaryCta: "ابدأ التحليل",
    secondaryCta: "استكشف الخدمات",
    avatarAlt: "شخصية ريادتك",
  },
  en: {
    // In LTR: "left of character" = RIADA, "right" = TECH
    leftWord: "RIADA",
    rightWord: "TECH",
    primaryCta: "Start Analysis",
    secondaryCta: "Explore Services",
    avatarAlt: "RiadaTech character",
  },
};

const FLOATING_ORBS = [
  { x: 8, y: 18, size: 10, depth: 0.55, delay: 0 },
  { x: 92, y: 22, size: 7, depth: 0.7, delay: 0.4 },
  { x: 14, y: 78, size: 14, depth: 0.4, delay: 0.8 },
  { x: 88, y: 74, size: 9, depth: 0.6, delay: 1.2 },
  { x: 28, y: 46, size: 5, depth: 0.85, delay: 1.6 },
  { x: 72, y: 52, size: 6, depth: 0.8, delay: 0.6 },
  { x: 50, y: 12, size: 4, depth: 0.95, delay: 1 },
  { x: 50, y: 92, size: 5, depth: 0.9, delay: 1.4 },
];

function HomeHero3D({ locale = "ar" }) {
  const heroRef = useRef(null);
  const rafRef = useRef(0);
  const targetRef = useRef({ x: 0, y: 0 });
  const currentRef = useRef({ x: 0, y: 0 });

  const text = heroCopy[locale] || heroCopy.ar;
  const isArabic = locale === "ar";

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return undefined;

    function tick() {
      currentRef.current.x += (targetRef.current.x - currentRef.current.x) * 0.08;
      currentRef.current.y += (targetRef.current.y - currentRef.current.y) * 0.08;

      const cx = currentRef.current.x;
      const cy = currentRef.current.y;

      hero.style.setProperty("--rt-mx", `${(cx * 50 + 50).toFixed(2)}%`);
      hero.style.setProperty("--rt-my", `${(cy * 50 + 50).toFixed(2)}%`);
      hero.style.setProperty("--rt-px", `${(cx * 18).toFixed(2)}px`);
      hero.style.setProperty("--rt-py", `${(cy * 14).toFixed(2)}px`);
      hero.style.setProperty("--rt-rx", `${(-cy * 5).toFixed(2)}deg`);
      hero.style.setProperty("--rt-ry", `${(cx * 7).toFixed(2)}deg`);
      // Subtle eye/head shift (used by image translate)
      hero.style.setProperty("--rt-ex", `${(cx * 6).toFixed(2)}px`);
      hero.style.setProperty("--rt-ey", `${(cy * 4).toFixed(2)}px`);

      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  function handleMouseMove(event) {
    const hero = heroRef.current;
    if (!hero) return;
    const bounds = hero.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width;
    const y = (event.clientY - bounds.top) / bounds.height;
    targetRef.current = { x: x * 2 - 1, y: y * 2 - 1 };
  }

  function handleMouseLeave() {
    targetRef.current = { x: 0, y: 0 };
  }

  return (
    <section
      ref={heroRef}
      className="rt-hero"
      id="home"
      dir={isArabic ? "rtl" : "ltr"}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      data-testid="home-hero"
    >
      <div className="rt-hero__grid" aria-hidden="true" />
      <div className="rt-hero__vignette" aria-hidden="true" />
      <div className="rt-hero__cursor-glow" aria-hidden="true" />

      <div className="rt-hero__orbs" aria-hidden="true">
        {FLOATING_ORBS.map((o, i) => (
          <span
            key={i}
            className="rt-hero__orb"
            style={{
              left: `${o.x}%`,
              top: `${o.y}%`,
              width: `${o.size}px`,
              height: `${o.size}px`,
              animationDelay: `${o.delay}s`,
              "--orb-depth": o.depth,
            }}
          />
        ))}
      </div>

      {/* The split-brand layout (always LTR grid for stable left/right positioning) */}
      <div className="rt-hero__split" dir="ltr">
        <motion.span
          className={`rt-hero__word rt-hero__word--left ${isArabic ? "is-arabic" : "is-latin"}`}
          initial={{ opacity: 0, x: -40, filter: "blur(10px)" }}
          animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
        >
          {isArabic ? heroCopy.ar.leftWord : heroCopy.en.leftWord}
        </motion.span>

        <motion.div
          className="rt-hero__center"
          initial={{ opacity: 0, scale: 0.92, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="rt-hero__halo" aria-hidden="true" />
          <div className="rt-hero__ring rt-hero__ring--a" aria-hidden="true" />
          <div className="rt-hero__ring rt-hero__ring--b" aria-hidden="true" />
          <div className="rt-hero__beam" aria-hidden="true" />

          <div className="rt-hero__avatar-wrap">
            <img
              className="rt-hero__avatar"
              src={omaniAvatar}
              alt={text.avatarAlt}
              draggable={false}
              data-testid="hero-avatar-image"
            />
            <div className="rt-hero__avatar-shadow" aria-hidden="true" />
          </div>
        </motion.div>

        <motion.span
          className={`rt-hero__word rt-hero__word--right ${isArabic ? "is-arabic" : "is-latin"}`}
          initial={{ opacity: 0, x: 40, filter: "blur(10px)" }}
          animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
        >
          {isArabic ? heroCopy.ar.rightWord : heroCopy.en.rightWord}
        </motion.span>
      </div>

      <motion.div
        className="rt-hero__cta-row"
        dir={isArabic ? "rtl" : "ltr"}
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.7 }}
      >
        <Link
          to="/map-analysis"
          className="rt-hero__btn rt-hero__btn--primary"
          data-testid="hero-start-analysis-btn"
        >
          <span>{text.primaryCta}</span>
          <ArrowUpRight size={18} />
        </Link>
        <a
          href="#services-keyboard"
          className="rt-hero__btn rt-hero__btn--ghost"
          data-testid="hero-explore-services-btn"
        >
          {text.secondaryCta}
        </a>
      </motion.div>
    </section>
  );
}

export default HomeHero3D;
