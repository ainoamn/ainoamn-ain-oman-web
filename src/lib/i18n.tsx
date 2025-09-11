// src/lib/i18n.tsx
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import ar from "@/locales/ar.json";
import en from "@/locales/en.json";

type Lang = "ar" | "en";
type Dict = Record<string, string>;
type Dir = "rtl" | "ltr";

const DICTS: Record<Lang, Dict> = { ar, en };
const RTL = new Set<Lang>(["ar"]);

export const isRTL = (l: string) => RTL.has((l || "ar").slice(0, 2) as Lang);
const dirOf = (l: Lang): Dir => (RTL.has(l) ? "rtl" : "ltr");
const norm = (v?: string | null): Lang => (String(v || "").toLowerCase().startsWith("ar") ? "ar" : "en");

function fmt(s: string, vars?: Record<string, string | number>) {
  if (!vars) return s;
  return s.replace(/\{(\w+)\}/g, (_, k) => (vars[k] != null ? String(vars[k]) : `{${k}}`));
}

// ---------- Overrides + Missing logger (اختياري لكنه مفيد) ----------
let missingBuffer: Set<string> | null = null;
let flushTimer: any = null;

async function fetchOverrides(lang: string): Promise<Dict> {
  try {
    const r = await fetch(`/api/i18n/overrides?lang=${lang}`);
    const j = await r.json();
    return j?.entries || {};
  } catch {
    return {};
  }
}
function reportMissing(lang: string, key: string) {
  if (typeof window === "undefined") return;
  missingBuffer ||= new Set<string>();
  const tag = `${lang}:${key}`;
  if (missingBuffer.has(tag)) return;
  missingBuffer.add(tag);
  clearTimeout(flushTimer);
  flushTimer = setTimeout(() => {
    const items = Array.from(missingBuffer || []);
    missingBuffer = new Set<string>();
    try {
      navigator.sendBeacon?.(
        "/api/i18n/missing",
        new Blob([JSON.stringify({ items })], { type: "application/json" })
      ) ||
        fetch("/api/i18n/missing", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ items }),
        });
    } catch {}
  }, 400);
}

// ---------- React context ----------
type Ctx = {
  lang: Lang;
  dir: Dir;
  setLang: (l: Lang) => void;
  t: (key: string, fallback?: string, vars?: Record<string, string | number>) => string;
};
const I18nContext = createContext<Ctx | null>(null);

export function I18nProvider({
  children,
  initialLang,
}: {
  children: React.ReactNode;
  initialLang?: string;
}) {
  const initial =
    norm(
      initialLang ||
        (typeof window !== "undefined" ? window.localStorage.getItem("locale") : "ar")
    ) || "ar";

  const [lang, setLangState] = useState<Lang>(initial);
  const [over, setOver] = useState<Dict>({});

  useEffect(() => {
    (async () => setOver(await fetchOverrides(lang)))();
  }, [lang]);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = lang;
      document.documentElement.dir = dirOf(lang);
      localStorage.setItem("locale", lang);
    }
  }, [lang]);

  const t = useMemo(() => {
    return (key: string, fallback?: string, vars?: Record<string, string | number>) => {
      // 1) overrides
      if (over && over[key] != null) return fmt(over[key], vars);
      // 2) القاموس الحالي
      const cur = DICTS[lang]?.[key];
      if (cur != null) return fmt(cur, vars);
      // 3) الإنكليزية كاحتياط
      const enVal = DICTS.en[key];
      if (enVal != null) return fmt(enVal, vars);
      // 4) fallback أو المفتاح نفسه + تسجيل مفقود
      reportMissing(lang, key);
      return fmt(fallback || key, vars);
    };
  }, [lang, over]);

  const value: Ctx = useMemo(
    () => ({
      lang,
      dir: dirOf(lang),
      setLang: (l) => setLangState(norm(l)),
      t,
    }),
    [lang, t]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}

// ---------- getT للاستخدامات القديمة (Header.tsx وغيرها) ----------
export function getT(router?: { locale?: string } | string | null) {
  let l: Lang = "ar";
  if (typeof router === "string") l = norm(router);
  else if (router && typeof (router as any).locale === "string") l = norm((router as any).locale);
  else if (typeof window !== "undefined" && localStorage.getItem("locale"))
    l = norm(localStorage.getItem("locale"));

  const dict = DICTS[l] || DICTS.ar;
  return (key: string, fallback?: string, vars?: Record<string, string | number>) => {
    const cur = dict[key];
    if (cur != null) return fmt(cur, vars);
    const enVal = DICTS.en[key];
    if (enVal != null) return fmt(enVal, vars);
    return fmt(fallback || key, vars);
  };
}

// دعم import getT كافتراضي أيضًا
export default getT;
