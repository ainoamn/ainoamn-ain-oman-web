// src/lib/i18n.tsx
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { NextRouter } from "next/router";

import ar from "@/locales/ar.json";
import en from "@/locales/en.json";
import fr from "@/locales/fr.json";
import hi from "@/locales/hi.json";
import fa from "@/locales/fa.json";
import ur from "@/locales/ur.json";

export type Lang = "ar" | "en" | "fr" | "hi" | "fa" | "ur";
export type Dict = Record<string, string>;
type Dir = "rtl" | "ltr";

// اجعل العربية افتراضيًا وصدّر القواميس
export const DICTS: Record<Lang, Dict> = { ar, en, fr, hi, fa, ur };
export const SUPPORTED_LANGS: Lang[] = ["ar", "en", "fr", "hi", "fa", "ur"];
const RTL_SET = new Set<Lang>(["ar", "fa", "ur"]);

export const isRTL = (l: string) => RTL_SET.has(l as Lang);
export const dirOf = (l: string): Dir => (isRTL(l) ? "rtl" : "ltr");

export function norm(v?: string | null): Lang {
  const x = String(v || "").toLowerCase();
  if (x.startsWith("ar")) return "ar";
  if (x.startsWith("fa")) return "fa";
  if (x.startsWith("ur")) return "ur";
  if (x.startsWith("fr")) return "fr";
  if (x.startsWith("hi")) return "hi";
  return "en";
}

function look(d: Dict | undefined, k: string) { return d ? d[k] : undefined; }
function fmt(s: string, vars?: Record<string, string | number>) {
  if (!vars) return s;
  return s.replace(/\{(\w+)\}/g, (_, k) => (vars[k] != null ? String(vars[k]) : `{${k}}`));
}
export function t(dict: Dict, key: string, vars?: Record<string, string | number>) {
  const v = look(dict, key); if (v != null) return fmt(v, vars);
  const enF = look(DICTS.en, key); if (enF != null) return fmt(enF, vars);
  const arF = look(DICTS.ar, key); if (arF != null) return fmt(arF, vars);
  return key;
}

// دعم المكوّنات القديمة
export function getT(router?: Partial<NextRouter> | { locale?: string } | string | null) {
  const lang = typeof router === "string" ? norm(router) : norm((router as any)?.locale) || "ar";
  const dict = DICTS[lang];
  return (k: string, vars?: Record<string, string | number>) => t(dict, k, vars);
}

type Ctx = { lang: Lang; dir: Dir; setLang: (l: Lang) => void; tt: (k: string, v?: Record<string, string|number>) => string; supported: Lang[]; };
const I18nContext = createContext<Ctx | null>(null);

export function I18nProvider({ children, initialLang }: { children: React.ReactNode; initialLang?: Lang | string; }) {
  const [lang, setLangState] = useState<Lang>(norm(initialLang || "ar"));
  const dir = dirOf(lang);

  const setLang = (l: Lang) => {
    const n = norm(l);
    setLangState(n);
    if (typeof window !== "undefined") localStorage.setItem("locale", n);
  };

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("lang", lang);
      document.documentElement.setAttribute("dir", dir);
    }
  }, [lang, dir]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const fromUrl = new URLSearchParams(window.location.search).get("lang");
    const stored = localStorage.getItem("locale");
    const cand = norm(fromUrl || stored || lang);
    if (cand !== lang) setLang(cand);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const tt = useMemo(() => {
    const d = DICTS[lang];
    return (k: string, v?: Record<string, string|number>) => t(d, k, v);
  }, [lang]);

  const value: Ctx = useMemo(() => ({ lang, dir, setLang, tt, supported: SUPPORTED_LANGS }), [lang, dir, tt]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider.");
  return ctx;
}
