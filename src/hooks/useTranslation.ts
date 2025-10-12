// src/hooks/useTranslation.ts
import { useEffect, useMemo, useState } from "react";
import { useI18n } from "@/lib/i18n";

type Dict = Record<string, string>;
let pending: Set<string> | null = null;
let flushTimer: any = null;

export function useTranslation() {
  const i18n: any = (useI18n as any) ? (useI18n as any)() : {};
  const rawT = typeof i18n?.t === "function" ? i18n.t : undefined;
  const dir: "rtl" | "ltr" = i18n?.dir === "ltr" ? "ltr" : "rtl";
  const lang: string = typeof i18n?.lang === "string" ? i18n.lang : "ar";

  const [overrides, setOverrides] = useState<Dict>({});
  useEffect(() => {
    if (typeof window === "undefined") return;
    fetch(`/api/i18n/overrides?lang=${lang}`).then(r=>r.json()).then(j=>setOverrides(j?.entries||{})).catch(()=>{});
  }, [lang]);

  function reportMissing(key: string) {
    if (typeof window === "undefined") return;
    pending ||= new Set<string>();
    const tag = `${lang}:${key}`;
    if (pending.has(tag)) return;
    pending.add(tag);
    clearTimeout(flushTimer);
    flushTimer = setTimeout(() => {
      const items = Array.from(pending || []);
      pending = new Set<string>();
      try {
        navigator.sendBeacon?.("/api/i18n/missing", new Blob([JSON.stringify({ items })], { type: "application/json" }))
          || fetch("/api/i18n/missing", { method: "POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify({ items }) });
      } catch {}
    }, 500);
  }

  const t = useMemo(() => {
    return (key: string, def?: string): string => {
      // 1) overrides
      if (overrides && overrides[key]) return overrides[key];
      // 2) النظام الأصلي
      const v = rawT ? rawT(key, def) : undefined;
      if (typeof v === "string" && v !== key) return v;
      // 3) الافتراضي الممرّر
      if (def) return def;
      // 4) إنعدام الترجمة → أبلغ وسلّم المفتاح
      reportMissing(key);
      return key;
    };
  }, [rawT, overrides, lang]);

  return { t, dir, lang };
}

// Export default يشير لنفس الدالة
export default useTranslation;
