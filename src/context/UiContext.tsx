import React, { createContext, useContext, useEffect } from "react";
import usePersistedState from "../hooks/usePersistedState";

type Locale = "ar"|"en"|"fr"|"hi"|"fa"|"ur";
type Currency = "OMR"|"AED"|"SAR"|"QAR"|"BHD"|"KWD"|"USD";
type Theme = "light"|"dark";
type PrimaryPalette = "turquoise"|"maroon"|"orange"|"yellow"|"green";

const paletteMap: Record<PrimaryPalette, {base:string; on:string}> = {
  turquoise: { base: "#00A8B5", on: "#ffffff" }, // الافتراضي
  maroon:    { base: "#7D1128", on: "#ffffff" },
  orange:    { base: "#FF7A00", on: "#2a1500" },
  yellow:    { base: "#FFC107", on: "#2a1f00" },
  green:     { base: "#16A34A", on: "#062611" },
};

type UiState = {
  locale: Locale; currency: Currency; theme: Theme; primary: PrimaryPalette;
  setLocale:(l:Locale)=>void; setCurrency:(c:Currency)=>void; setTheme:(t:Theme)=>void; setPrimary:(p:PrimaryPalette)=>void;
};

const UiContext = createContext<UiState | null>(null);

export function UiProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale]     = usePersistedState<Locale>("ainoman:locale", "ar");
  const [currency, setCurrency] = usePersistedState<Currency>("ainoman:currency", "OMR");
  const [theme, setTheme]       = usePersistedState<Theme>("ainoman:theme", "light");
  const [primary, setPrimary]   = usePersistedState<PrimaryPalette>("ainoman:primary", "turquoise");

  useEffect(() => {
    if (typeof document === "undefined") return;
    const rtl = ["ar","fa","ur"].includes(locale);
    document.documentElement.setAttribute("dir", rtl ? "rtl" : "ltr");
    document.documentElement.setAttribute("lang", locale);
  }, [locale]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    const { base, on } = paletteMap[primary];
    root.style.setProperty("--primary", base);
    root.style.setProperty("--on-primary", on);
    root.style.setProperty("--primary-80", hexToRgba(base, 0.80));
    root.style.setProperty("--primary-75", hexToRgba(base, 0.75)); // للفوتر
    root.classList.toggle("dark", theme === "dark");
  }, [primary, theme]);

  const value: UiState = { locale, currency, theme, primary, setLocale, setCurrency, setTheme, setPrimary };
  return <UiContext.Provider value={value}>{children}</UiContext.Provider>;
}

export function useUi(){
  const ctx = useContext(UiContext);
  if(!ctx) throw new Error("useUi must be used within UiProvider");
  return ctx;
}

function hexToRgba(hex: string, alpha: number) {
  const c = hex.replace("#","");
  const bigint = parseInt(c, 16);
  const r = (bigint >> 16) & 255, g = (bigint >> 8) & 255, b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
