// src/lib/i18n-ai.ts
import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";

export type Lang = "ar" | "en" | "fr" | "hi" | "fa" | "ur";
const SUPPORTED: Lang[] = ["ar", "en", "fr", "hi", "fa", "ur"];
const RTL: Lang[] = ["ar", "fa", "ur"];

const isBrowser = () => typeof window !== "undefined" && typeof document !== "undefined";
const norm = (s?: string | null): Lang => {
  const p = (s || "").toLowerCase().split("-")[0] as Lang;
  return SUPPORTED.includes(p) ? p : "ar";
};

function getUrlLang(): Lang | null {
  if (!isBrowser()) return null;
  const p = new URLSearchParams(window.location.search).get("lang");
  return p ? norm(p) : null;
}

function guessLang(): Lang {
  const u = getUrlLang();
  if (u) return u;
  if (isBrowser()) {
    const saved = localStorage.getItem("lang");
    if (saved) return norm(saved);
    const html = document.documentElement.getAttribute("lang");
    if (html) return norm(html);
    const nav = (navigator as any).language || (((navigator as any).languages || [])[0] as string | undefined) || "";
    if (nav) return norm(nav);
  }
  return "ar";
}

function setHtml(l: Lang) {
  if (!isBrowser()) return;
  document.documentElement.setAttribute("lang", l);
  document.documentElement.setAttribute("dir", RTL.includes(l) ? "rtl" : "ltr");
  document.body.classList.toggle("rtl", RTL.includes(l));
}

type Ctx = {
  lang: Lang;
  dir: "rtl" | "ltr";
  setLang: (l: Lang) => void;
  t: (text: string, vars?: Record<string, string | number>) => string;
  prefetch: (text: string) => void;
  supported: Lang[];
};

const C = createContext<Ctx | null>(null);

// ذاكرة مؤقتة في الواجهة
const mem = new Map<string, string>();
const keyOf = (text: string, target: Lang) => `${target}::${text}`;

function formatVars(s: string, vars?: Record<string, string | number>) {
  if (!vars) return s;
  let out = s;
  for (const [k, v] of Object.entries(vars)) out = out.split(`{${k}}`).join(String(v));
  return out;
}

async function askServer(text: string, targetLang: Lang): Promise<string> {
  const r = await fetch("/api/ai-translate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, targetLang }),
  });
  const j = await r.json();
  if (!r.ok || !j.ok) throw new Error(j.error || "translation failed");
  return j.translation as string;
}

export function AI18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(guessLang());
  const dir: "rtl" | "ltr" = RTL.includes(lang) ? "rtl" : "ltr";
  const [, force] = useState(0);
  const mounted = useRef(false);

  useEffect(() => {
    setHtml(lang);
    if (isBrowser()) {
      try { localStorage.setItem("lang", lang); } catch {}
    }
  }, [lang]);

  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);

  const setLang = (l: Lang) => setLangState(norm(l));

  const prefetch = (text: string) => {
    if (!isBrowser()) return;
    const k = keyOf(text, lang);
    if (mem.has(k)) return;
    askServer(text, lang).then((tr) => {
      mem.set(k, tr);
      if (mounted.current) force((x) => x + 1);
    }).catch(() => {});
  };

  const t = useMemo(() => {
    return (text: string, vars?: Record<string, string | number>) => {
      if (!isBrowser()) return formatVars(text, vars); // تجنّب طلبات أثناء SSR
      if (lang === "ar") return formatVars(text, vars); // العربي يعاد كما هو
      const k = keyOf(text, lang);
      const cached = mem.get(k);
      if (cached) return formatVars(cached, vars);
      askServer(text, lang).then((tr) => {
        mem.set(k, tr);
        if (mounted.current) force((x) => x + 1);
      }).catch(() => {});
      return formatVars(text, vars);
    };
  }, [lang]);

  const value: Ctx = { lang, dir, setLang, t, prefetch, supported: SUPPORTED };

  // بدون JSX
  return React.createElement(C.Provider, { value }, children as any);
}

export function useAI18n() {
  const ctx = useContext(C);
  if (!ctx) throw new Error("useAI18n must be used within <AI18nProvider>.");
  return ctx;
}

export function Trans(props: { children: string; vars?: Record<string, string | number> }) {
  const { t } = useAI18n();
  const content = t(props.children, props.vars);
  return React.createElement(React.Fragment, null, content);
}
