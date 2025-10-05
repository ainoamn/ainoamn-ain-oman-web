// src/lib/widgetsSync.ts
import { useEffect, useMemo, useState } from "react";

/* نفس المفاتيح التي تستخدمها صفحة widgets */
export const LS_ADMIN = "ain.dashboard.admin";
export const LS_WIDGET_OVERRIDES = "ain.dashboard.widget.overrides";
export const LS_ADMIN_LINKS = "ain.dashboard.admin.links";

/* أدوات تخزين آمنة */
function loadJSON<T>(key: string, fallback: T, validate?: (v:any)=>boolean): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const v = JSON.parse(raw);
    if (validate && !validate(v)) throw new Error("invalid shape");
    return v as T;
  } catch {
    try { localStorage.removeItem(key); } catch {}
    return fallback;
  }
}

type AdminToggles = Record<string, boolean>;
type WidgetOverride = { label?: string; iconKey?: string; hidden?: boolean };
type WidgetOverrides = Record<string, WidgetOverride>;
type AdminLink = { id?: string; label: string; href: string; iconKey?: string };

export function useWidgetsSync() {
  const [adm, setAdm] = useState<AdminToggles>({});
  const [ov, setOv]   = useState<WidgetOverrides>({});
  const [links, setLinks] = useState<AdminLink[]>([]);

  useEffect(() => {
    const loadAll = () => {
      setAdm(loadJSON<AdminToggles>(LS_ADMIN, {}, (x)=>typeof x==="object"));
      setOv(loadJSON<WidgetOverrides>(LS_WIDGET_OVERRIDES, {}, (x)=>typeof x==="object"));
      setLinks(loadJSON<AdminLink[]>(LS_ADMIN_LINKS, [], Array.isArray));
    };
    loadAll();

    const onAdm = () => loadAll();
    const onOv  = () => loadAll();
    const onLinks = () => loadAll();

    window.addEventListener("ain:adminDefaults:change", onAdm);
    window.addEventListener("ain:widgetOverrides:change", onOv);
    window.addEventListener("ain:adminLinks:change", onLinks);

    return () => {
      window.removeEventListener("ain:adminDefaults:change", onAdm);
      window.removeEventListener("ain:widgetOverrides:change", onOv);
      window.removeEventListener("ain:adminLinks:change", onLinks);
    };
  }, []);

  const isOn = (key: string, defaultOn = true) =>
    (adm?.[key] ?? defaultOn) && !(ov?.[key]?.hidden);

  const labelOf = (key: string, fallback: string) =>
    ov?.[key]?.label?.trim() || fallback;

  return { adm, ov, links, isOn, labelOf };
}
