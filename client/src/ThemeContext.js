import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "riadatach-theme";
const ThemeContext = createContext(null);

function getInitialTheme() {
  if (typeof window === "undefined") {
    return "light";
  }

  const savedTheme = window.localStorage.getItem(STORAGE_KEY);
  return savedTheme === "dark" ? "dark" : "light";
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    const themeClass = `theme-${theme}`;
    const rootElement = document.getElementById("root");

    document.documentElement.dataset.theme = theme;
    document.body.dataset.theme = theme;

    document.documentElement.className = themeClass;
    document.body.className = themeClass;

    if (rootElement) {
      rootElement.className = themeClass;
      rootElement.dataset.theme = theme;
    }

    window.localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const value = useMemo(
    () => ({
      theme,
      isDark: theme === "dark",
      setTheme,
      toggleTheme: () =>
        setTheme((currentTheme) => (currentTheme === "dark" ? "light" : "dark")),
    }),
    [theme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider.");
  }

  return context;
}
