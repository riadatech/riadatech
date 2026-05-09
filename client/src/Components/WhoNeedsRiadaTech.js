import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import omAvatar from "../assets/om.png";
import "./WhoNeedsRiadaTech.css";

const copy = {
  ar: {
    eyebrow: "الجمهور المستهدف",
    title: "من يحتاج ريادتك؟",
    items: [
      { id: "abaya", label: "محلات العبايات" },
      { id: "clothing", label: "محلات الملابس" },
      { id: "cafes", label: "المقاهي" },
      { id: "restaurants", label: "المطاعم" },
      { id: "pharmacies", label: "الصيدليات" },
      { id: "salons", label: "الصالونات" },
      { id: "startups", label: "المشاريع الناشئة" },
      { id: "shops", label: "المتاجر الصغيرة" },
    ],
  },
  en: {
    eyebrow: "Who it's for",
    title: "Who Needs RiadaTech?",
    items: [
      { id: "abaya", label: "Abaya Stores" },
      { id: "clothing", label: "Clothing Stores" },
      { id: "cafes", label: "Cafes" },
      { id: "restaurants", label: "Restaurants" },
      { id: "pharmacies", label: "Pharmacies" },
      { id: "salons", label: "Salons" },
      { id: "startups", label: "Startups" },
      { id: "shops", label: "Small Shops" },
    ],
  },
};

// Stable resting positions in % within the field (top, left).
const POSITIONS = [
  { top: 18, left: 12 },
  { top: 12, left: 38 },
  { top: 24, left: 68 },
  { top: 16, left: 88 },
  { top: 60, left: 18 },
  { top: 72, left: 44 },
  { top: 64, left: 70 },
  { top: 78, left: 90 },
];

const SIZES = [120, 110, 132, 100, 124, 116, 108, 130];

function WhoNeedsRiadaTech({ locale = "ar" }) {
  const isArabic = locale === "ar";
  const t = copy[locale] || copy.ar;
  const fieldRef = useRef(null);
  const [mouse, setMouse] = useState({ x: -9999, y: -9999, active: false });

  // Dampen mouse position for smoother repulsion
  const targetRef = useRef({ x: -9999, y: -9999 });
  const rafRef = useRef(0);

  useEffect(() => {
    function tick() {
      setMouse((current) => {
        if (!targetRef.current.active && current.x === -9999) return current;
        return {
          x: current.x + (targetRef.current.x - current.x) * 0.18,
          y: current.y + (targetRef.current.y - current.y) * 0.18,
          active: targetRef.current.active,
        };
      });
      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  function handleMouseMove(event) {
    const field = fieldRef.current;
    if (!field) return;
    const rect = field.getBoundingClientRect();
    targetRef.current = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
      active: true,
    };
  }

  function handleMouseLeave() {
    targetRef.current = { x: -9999, y: -9999, active: false };
  }

  // Compute repulsion offset for a ball given its base center
  function getOffset(baseLeftPx, baseTopPx) {
    if (!mouse.active) return { dx: 0, dy: 0 };
    const dx = baseLeftPx - mouse.x;
    const dy = baseTopPx - mouse.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const radius = 160;
    if (dist > radius) return { dx: 0, dy: 0 };
    const force = (1 - dist / radius) * 60; // max 60px push
    const angle = Math.atan2(dy, dx);
    return {
      dx: Math.cos(angle) * force,
      dy: Math.sin(angle) * force,
    };
  }

  return (
    <section
      className="rt-balls"
      id="who-needs"
      dir={isArabic ? "rtl" : "ltr"}
      data-testid="who-needs-section"
    >
      <div className="rt-balls__bg" aria-hidden="true" />

      <div className="rt-balls__inner">
        <motion.div
          className="rt-balls__head"
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="rt-balls__eyebrow">{t.eyebrow}</span>
          <h2 className="rt-balls__title" data-lang={locale}>
            {t.title}
          </h2>
        </motion.div>

        <div
          ref={fieldRef}
          className="rt-balls__field"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          dir="ltr"
        >
          {/* Central character guide */}
          <motion.div
            className="rt-balls__guide"
            initial={{ opacity: 0, scale: 0.8, y: 30 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            aria-hidden="true"
          >
            <div className="rt-balls__guide-glow" />
            <img
              src={omAvatar}
              alt=""
              className="rt-balls__guide-img"
              draggable={false}
            />
          </motion.div>

          {t.items.map((item, i) => {
            const pos = POSITIONS[i % POSITIONS.length];
            const size = SIZES[i % SIZES.length];
            const baseLeftPx = ((pos.left / 100) * (fieldRef.current?.clientWidth || 1000));
            const baseTopPx = ((pos.top / 100) * (fieldRef.current?.clientHeight || 600));
            const off = getOffset(baseLeftPx, baseTopPx);

            return (
              <motion.div
                key={item.id}
                className="rt-balls__ball"
                initial={{ opacity: 0, scale: 0.6 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{
                  duration: 0.7,
                  ease: [0.22, 1, 0.36, 1],
                  delay: i * 0.06,
                }}
                style={{
                  top: `${pos.top}%`,
                  left: `${pos.left}%`,
                  width: `${size}px`,
                  height: `${size}px`,
                  transform: `translate(calc(-50% + ${off.dx}px), calc(-50% + ${off.dy}px))`,
                  animationDelay: `${i * 0.5}s`,
                }}
                data-testid={`ball-${item.id}`}
              >
                <span className="rt-balls__ball-glow" aria-hidden="true" />
                <span className="rt-balls__ball-label" data-lang={locale}>
                  {item.label}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default WhoNeedsRiadaTech;
