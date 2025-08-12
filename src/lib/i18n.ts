/* i18n بسيط بدون مكتبات خارجية — يعتمد على ملفات JSON ثابتة داخل المشروع تحت src/locales */
import { NextRouter } from "next/router";

// ✅ مسارات صحيحة لأن مجلد locales أصبح داخل src/locales
import ar from "../locales/ar.json";
import en from "../locales/en.json";
import fr from "../locales/fr.json";
import hi from "../locales/hi.json";
import fa from "../locales/fa.json";
import ur from "../locales/ur.json";

export type Dict = Record<string, string>;
const dictionaries: Record<string, Dict> = { ar, en, fr, hi, fa, ur };

export function getDict(locale?: string): Dict {
  if (!locale) return ar;
  return dictionaries[locale] ?? ar;
}

/** لغات من اليمين لليسار */
export function isRTL(locale?: string): boolean {
  return ["ar", "fa", "ur"].includes(locale || "ar");
}

/** دالة ترجمة بسيطة: t(dict, "homepage.hero_title", {name: "…"}) */
export function t(dict: Dict, key: string, vars?: Record<string, string | number>) {
  const str = dict[key] ?? key;
  if (!vars) return str;
  return Object.keys(vars).reduce(
    (acc, k) => acc.replace(new RegExp(`{${k}}`, "g"), String(vars[k])),
    str
  );
}

/** مساعد للاستخدام داخل المكوّنات: const tt = getT(router); tt("nav.home") */
export function getT(router: NextRouter) {
  const dict = getDict(router.locale ?? "ar");
  return (key: string, vars?: Record<string, string | number>) => t(dict, key, vars);
}
