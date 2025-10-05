// src/hooks/useHeaderFooterConfig.ts
"use client";
import { useEffect, useState } from "react";
import { CONFIG_KEY, defaultConfig, HeaderFooterConfig, mergeConfig } from "@/lib/headerFooterConfig";

export function useHeaderFooterConfig() {
  const [config, setConfig] = useState<HeaderFooterConfig>(defaultConfig);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const local = typeof window !== "undefined" ? localStorage.getItem(CONFIG_KEY) : null;
    if (local) {
      try { setConfig(mergeConfig(defaultConfig, JSON.parse(local))); } catch {}
    }
    (async () => {
      try {
        const res = await fetch("/api/header-footer");
        if (res.ok) {
          const remote = await res.json();
          setConfig(c => mergeConfig(c, remote));
        }
      } finally { setLoading(false); }
    })();
  }, []);

  // ضخ الألوان إلى CSS variables
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--brand-600", config.primaryColor);
    // مشتق لدرجة أغمق بسيطة
    root.style.setProperty("--brand-700", shade(config.primaryColor, -8));
    root.style.setProperty("--brand-800", shade(config.primaryColor, -16));
    root.style.setProperty("--footer-opacity", String(config.footerOpacity));
  }, [config.primaryColor, config.footerOpacity]);

  const save = async (patch: Partial<HeaderFooterConfig>) => {
    const next = mergeConfig(config, patch);
    setConfig(next);
    if (typeof window !== "undefined") localStorage.setItem(CONFIG_KEY, JSON.stringify(next));
    await fetch("/api/header-footer", { method: "POST", headers: { "Content-Type":"application/json" }, body: JSON.stringify(next) });
  };

  return { config, setConfig: (c: Partial<HeaderFooterConfig>) => save(c), loading };
}

/** تفتيح/تغميق بسيط للّون HEX */
function shade(hex: string, percent: number) {
  const p = Math.max(-100, Math.min(100, percent)) / 100;
  const n = parseInt(hex.slice(1), 16);
  const r = n >> 16, g = (n >> 8) & 0xff, b = n & 0xff;
  const rr = clamp(Math.round(r + (p < 0 ? r : 255 - r) * p));
  const gg = clamp(Math.round(g + (p < 0 ? g : 255 - g) * p));
  const bb = clamp(Math.round(b + (p < 0 ? b : 255 - b) * p));
  return "#" + ((1 << 24) + (rr << 16) + (gg << 8) + bb).toString(16).slice(1);
}
function clamp(v:number){ return Math.min(255, Math.max(0, v)); }
