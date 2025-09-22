// src/lib/i18n.tsx
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

type Lang = "ar" | "en";
type Dict = Record<string, string>;
type Dir = "rtl" | "ltr";

const DICTS: Record<Lang, Dict> = { ar: {}, en: {} }; // مؤقتًا بدون ملفات JSON
const RTL = new Set<Lang>(["ar"]);

export const isRTL = (l: string) => RTL.has((l || "ar").slice(0, 2) as Lang);
const dirOf = (l: Lang): Dir => (RTL.has(l) ? "rtl" : "ltr");
const norm = (v?: string | null): Lang => (String(v || "").toLowerCase().startsWith("ar") ? "ar" : "en");

function fmt(s: string, vars?: Record<string, string | number>) {
  if (!vars) return s;
  return s.replace(/\{(\w+)\}/g, (_, k) => (vars[k] != null ? String(vars[k]) : `{${k}}`));
}

type Ctx = {
  lang: Lang;
  dir: Dir;
  setLang: (l: Lang) => void;
  t: (key: string, fallback?: string, vars?: Record<string, string | number>) => string;
};
const I18nContext = createContext<Ctx | null>(null);

export function I18nProvider({ children, initialLang }: { children: React.ReactNode; initialLang?: string; }) {
  const initial = norm(initialLang || (typeof window !== "undefined" ? window.localStorage.getItem("locale") : "ar")) || "ar";
  const [lang, setLangState] = useState<Lang>(initial);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = lang;
      document.documentElement.dir = dirOf(lang);
      localStorage.setItem("locale", lang);
    }
  }, [lang]);

  const t = useMemo(() => {
    return (key: string, fallback?: string, vars?: Record<string, string | number>) => {
      const cur = DICTS[lang]?.[key];
      if (cur != null) return fmt(cur, vars);
      const enVal = DICTS.en[key];
      if (enVal != null) return fmt(enVal, vars);
      return fmt(fallback || key, vars);
    };
  }, [lang]);

  const value: Ctx = useMemo(() => ({ lang, dir: dirOf(lang), setLang: (l) => setLangState(norm(l)), t }), [lang, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}

// getT للاستخدامات القديمة
export function getT(router?: { locale?: string } | string | null) {
  let l: Lang = "ar";
  if (typeof router === "string") l = norm(router);
  else if (router && typeof (router as any).locale === "string") l = norm((router as any).locale);
  else if (typeof window !== "undefined" && localStorage.getItem("locale")) l = norm(localStorage.getItem("locale"));

  const dict = DICTS[l] || DICTS.ar;
  return (key: string, fallback?: string, vars?: Record<string, string | number>) => {
    const cur = dict[key];
    if (cur != null) return fmt(cur, vars);
    const enVal = DICTS.en[key];
    if (enVal != null) return fmt(enVal, vars);
    return fmt(fallback || key, vars);
  };
}

export default getT; // default وحيد
