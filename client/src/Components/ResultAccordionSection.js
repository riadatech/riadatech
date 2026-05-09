import React from "react";
import {
  Activity,
  Building2,
  ChevronDown,
  ChevronUp,
  House,
  Layers3,
  MapPinned,
} from "lucide-react";

const sectionIcons = {
  overview: Activity,
  scores: Layers3,
  alternatives: MapPinned,
  competitors: Building2,
  rentals: House,
};

function ResultAccordionSection({
  sectionKey,
  title,
  description,
  badge,
  isOpen,
  onToggle,
  children,
}) {
  const Icon = sectionIcons[sectionKey] || Layers3;

  return (
    <section
      className={`rt-map-accordion-card rt-map-glow-panel rt-map-accordion-section-${sectionKey} ${
        isOpen ? "open" : ""
      }`}
    >
      <button
        type="button"
        className="rt-map-accordion-toggle"
        onClick={() => onToggle(sectionKey)}
        aria-expanded={isOpen}
      >
        <span className="rt-map-accordion-copy">
          <span className="rt-map-accordion-icon">
            <Icon size={18} />
          </span>
          <span>
            <strong>{title}</strong>
            <small>{description}</small>
          </span>
        </span>
        <span className="rt-map-accordion-actions">
          {badge ? <span className="rt-map-accordion-badge">{badge}</span> : null}
          {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </span>
      </button>
      {isOpen ? <div className="rt-map-accordion-content">{children}</div> : null}
    </section>
  );
}

export default ResultAccordionSection;
