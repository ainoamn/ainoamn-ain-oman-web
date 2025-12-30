// src/lib/i18n-enhanced.tsx - نظام متعدد اللغات محسّن
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

// اللغات المدعومة
export type SupportedLang = "ar" | "en" | "fr" | "hi" | "ur" | "fa" | "zh";
export type Dict = Record<string, string>;
export type Dir = "rtl" | "ltr";

// معلومات اللغات
export const LANGUAGES: Record<SupportedLang, { name: string; nativeName: string; dir: Dir; flag: string }> = {
  ar: { name: "Arabic", nativeName: "العربية", dir: "rtl", flag: "🇴🇲" },
  en: { name: "English", nativeName: "English", dir: "ltr", flag: "🇬🇧" },
  fr: { name: "French", nativeName: "Français", dir: "ltr", flag: "🇫🇷" },
  hi: { name: "Hindi", nativeName: "हिन्दी", dir: "ltr", flag: "🇮🇳" },
  ur: { name: "Urdu", nativeName: "اردو", dir: "rtl", flag: "🇵🇰" },
  fa: { name: "Persian", nativeName: "فارسی", dir: "rtl", flag: "🇮🇷" },
  zh: { name: "Chinese", nativeName: "中文", dir: "ltr", flag: "🇨🇳" },
};

const RTL_LANGS = new Set<SupportedLang>(["ar", "ur", "fa"]);
export const SUPPORTED_LANGS: SupportedLang[] = ["ar", "en", "fr", "hi", "ur", "fa", "zh"];

// تحميل القواميس
const loadDict = async (lang: SupportedLang): Promise<Dict> => {
  try {
    // محاولة تحميل من ملفات JSON
    const dict = await import(`@/locales/${lang}/common.json`).catch(() => null);
    return dict?.default || {};
  } catch {
    return {};
  }
};

// دالة الترجمة
function fmt(s: string, vars?: Record<string, string | number>) {
  if (!vars) return s;
  return s.replace(/\{(\w+)\}/g, (_, k) => (vars[k] != null ? String(vars[k]) : `{${k}}`));
}

// الترجمة بالذكاء الاصطناعي
async function translateWithAI(text: string, targetLang: SupportedLang): Promise<string> {
  try {
    const response = await fetch('/api/ai/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, targetLang }),
    });
    
    if (response.ok) {
      const data = await response.json();
      return data.translatedText || text;
    }
  } catch (error) {
    console.error('AI Translation error:', error);
  }
  
  return text; // Fallback إلى النص الأصلي
}

type I18nContextType = {
  lang: SupportedLang;
  dir: Dir;
  setLang: (l: SupportedLang) => void;
  t: (key: string, fallback?: string, vars?: Record<string, string | number>) => string;
  translate: (text: string, targetLang?: SupportedLang) => Promise<string>;
  supported: SupportedLang[];
  getLanguageInfo: (lang: SupportedLang) => typeof LANGUAGES[SupportedLang];
};

const I18nContext = createContext<I18nContextType | null>(null);

// تحديد اللغة الأولية
function getInitialLang(): SupportedLang {
  if (typeof window === "undefined") return "ar";
  
  // من localStorage
  const saved = localStorage.getItem("locale") || localStorage.getItem("lang");
  if (saved && SUPPORTED_LANGS.includes(saved as SupportedLang)) {
    return saved as SupportedLang;
  }
  
  // من المتصفح
  const browserLang = navigator.language.split("-")[0];
  if (SUPPORTED_LANGS.includes(browserLang as SupportedLang)) {
    return browserLang as SupportedLang;
  }
  
  return "ar"; // افتراضي
}

// تطبيق اللغة على HTML
function applyLang(lang: SupportedLang) {
  if (typeof document === "undefined") return;
  
  document.documentElement.lang = lang;
  document.documentElement.dir = LANGUAGES[lang].dir;
  
  // إضافة فئة للغة
  document.documentElement.classList.remove(...SUPPORTED_LANGS.map(l => `lang-${l}`));
  document.documentElement.classList.add(`lang-${lang}`);
}

export function EnhancedI18nProvider({ 
  children, 
  initialLang 
}: { 
  children: React.ReactNode; 
  initialLang?: SupportedLang;
}) {
  const [lang, setLangState] = useState<SupportedLang>(initialLang || getInitialLang());
  const [dicts, setDicts] = useState<Record<SupportedLang, Dict>>({
    ar: {},
    en: {},
    fr: {},
    hi: {},
    ur: {},
    fa: {},
    zh: {},
  });

  // تحميل القواميس
  useEffect(() => {
    const loadAllDicts = async () => {
      const loaded: Record<SupportedLang, Dict> = { ...dicts };
      for (const l of SUPPORTED_LANGS) {
        try {
          loaded[l] = await loadDict(l);
        } catch (error) {
          console.warn(`Failed to load dict for ${l}:`, error);
        }
      }
      setDicts(loaded);
    };
    loadAllDicts();
  }, []);

  // تطبيق اللغة
  useEffect(() => {
    applyLang(lang);
    if (typeof window !== "undefined") {
      localStorage.setItem("locale", lang);
      localStorage.setItem("lang", lang);
    }
  }, [lang]);

  // دالة الترجمة
  const t = useMemo(() => {
    return (key: string, fallback?: string, vars?: Record<string, string | number>) => {
      // البحث في اللغة الحالية
      const currentDict = dicts[lang];
      if (currentDict?.[key]) {
        return fmt(currentDict[key], vars);
      }
      
      // البحث في الإنجليزية كبديل
      if (lang !== "en" && dicts.en?.[key]) {
        return fmt(dicts.en[key], vars);
      }
      
      // استخدام fallback أو المفتاح
      return fmt(fallback || key, vars);
    };
  }, [lang, dicts]);

  // دالة الترجمة بالذكاء الاصطناعي
  const translate = useMemo(() => {
    return async (text: string, targetLang?: SupportedLang): Promise<string> => {
      const target = targetLang || lang;
      if (target === lang) return text;
      return translateWithAI(text, target);
    };
  }, [lang]);

  const getLanguageInfo = (l: SupportedLang) => LANGUAGES[l];

  const value: I18nContextType = useMemo(
    () => ({
      lang,
      dir: LANGUAGES[lang].dir,
      setLang: (l: SupportedLang) => {
        if (SUPPORTED_LANGS.includes(l)) {
          setLangState(l);
        }
      },
      t,
      translate,
      supported: SUPPORTED_LANGS,
      getLanguageInfo,
    }),
    [lang, t, translate]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    // Fallback للاستخدامات القديمة
    return {
      lang: "ar" as SupportedLang,
      dir: "rtl" as Dir,
      setLang: () => {},
      t: (key: string, fallback?: string) => fallback || key,
      translate: async (text: string) => text,
      supported: SUPPORTED_LANGS,
      getLanguageInfo: (l: SupportedLang) => LANGUAGES[l],
    };
  }
  return ctx;
}

// دالة مساعدة للاستخدام خارج المكونات
export function getT(lang?: SupportedLang) {
  const currentLang = lang || (typeof window !== "undefined" ? (localStorage.getItem("locale") as SupportedLang) || "ar" : "ar");
  return (key: string, fallback?: string, vars?: Record<string, string | number>) => {
    // في الإنتاج، سيتم تحميل القواميس
    return fmt(fallback || key, vars);
  };
}

// دالة للحصول على الاتجاه
export function getDir(lang?: SupportedLang): Dir {
  const l = lang || (typeof window !== "undefined" ? (localStorage.getItem("locale") as SupportedLang) || "ar" : "ar");
  return LANGUAGES[l]?.dir || "rtl";
}

// دالة للتحقق من RTL
export function isRTL(lang?: SupportedLang): boolean {
  const l = lang || (typeof window !== "undefined" ? (localStorage.getItem("locale") as SupportedLang) || "ar" : "ar");
  return RTL_LANGS.has(l);
}






