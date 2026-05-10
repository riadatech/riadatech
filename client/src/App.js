import React, { useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import Funding from "./Components/Funding.jsx";
import Home from "./Components/Home";
import IntroSplash from "./Components/IntroSplash";
import Login from "./Components/Login.jsx";
import MapAnalysis from "./Components/MapAnalysis";
import Profile from "./Components/Profile";
import Register from "./Components/Register.jsx";
import ScrollToTop from "./Components/ScrollToTop";
import SiteHeader from "./Components/SiteHeader";
import SmartAssistant from "./Components/SmartAssistant";
import { ThemeProvider } from "./ThemeContext";

function AppShell() {
  const [locale, setLocale] = useState("ar");

  return (
    <>
      <ScrollToTop />
      <IntroSplash />
      <SiteHeader locale={locale} setLocale={setLocale} showCta />
      <Routes>
        <Route path="/" element={<Home locale={locale} />} />
        <Route path="/login" element={<Login locale={locale} />} />
        <Route path="/map-analysis" element={<MapAnalysis locale={locale} />} />
        <Route path="/assistant" element={<SmartAssistant locale={locale} />} />
        <Route path="/funding" element={<Funding locale={locale} />} />
        <Route path="/profile" element={<Profile locale={locale} />} />
        <Route path="/register" element={<Register locale={locale} />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AppShell />
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
