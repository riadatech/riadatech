import React from "react";
import { Moon, Sun } from "lucide-react";

import { useTheme } from "../ThemeContext";

function ThemeToggleButton({ className = "", style, locale = "en" }) {
  const { isDark, toggleTheme } = useTheme();

  const label =
    locale === "ar"
      ? isDark
        ? "الوضع الداكن"
        : "الوضع الفاتح"
      : isDark
      ? "Dark mode"
      : "Light mode";

  return (
    <button
      type="button"
      className={className}
      style={style}
      onClick={toggleTheme}
      aria-label={label}
      title={label}
    >
      {isDark ? <Moon size={18} strokeWidth={2.2} /> : <Sun size={18} strokeWidth={2.2} />}
    </button>
  );
}

export default ThemeToggleButton;
