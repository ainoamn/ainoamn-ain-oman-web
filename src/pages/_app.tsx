// src/pages/_app.tsx
import type { AppProps } from "next/app";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect } from "react";

// اختر المسار الصحيح حسب بنية مشروعك:
// - إذا كان لديك `src/pages/_app.tsx` فاستخدم:
import "../../styles/globals.css";
// - وإن كان لديك `pages/_app.tsx` مباشرة، غيّرها إلى:
// import "../styles/globals.css";

// i18n Provider الذي زوّدناك به سابقًا
import { I18nProvider, useI18n } from "@/lib/i18n";

// مزوِّدات اختيارية: سنحاول استيرادها إن وُجدت، وإلا سنستخدم بدائل خفيفة لا تعطل البناء.
let GoogleMapsProvider: any = ({ children }: any) => <>{children}</>;
try {
  GoogleMapsProvider = require("../components/maps/GoogleMapsProvider").default || GoogleMapsProvider;
} catch {}

let CurrencyProvider: any = ({ children }: any) => <>{children}</>;
try {
  CurrencyProvider = require("../context/CurrencyContext").CurrencyProvider || CurrencyProvider;
} catch {}

let ChatProvider: any = ({ children }: any) => <>{children}</>;
let ChatWidget: any = () => null;
let FloatingButtons: any = () => null;
try {
  ChatProvider = require("../context/ChatContext").ChatProvider || ChatProvider;
} catch {}
try {
  ChatWidget = require("../components/chat/ChatWidget").default || ChatWidget;
} catch {}
try {
  FloatingButtons = require("../components/floating/FloatingButtons").default || FloatingButtons;
} catch {}

// مكوّن صغير لمزامنة لغة i18n مع locale الخاصة بـ Next (إن تم تفعيل i18n في next.config.js)
function LangSyncer({ locale }: { locale?: string }) {
  const { setLang } = useI18n();
  useEffect(() => {
    if (locale === "ar" || locale === "en") setLang(locale);
  }, [locale, setLang]);
  return null;
}

// تهيئة السمات والمظهر (دارك/لايت) + إعداد ألوان العلامة من /api/config (اختياري)
function ThemeAndBrandBoot() {
  useEffect(() => {
    try {
      const saved = localStorage.getItem("theme");
      const prefersDark =
        typeof window !== "undefined" &&
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches;
      const useDark = saved ? saved === "dark" : !!prefersDark;
      document.documentElement.classList.toggle("dark", useDark);
    } catch {}

    (async () => {
      try {
        const res = await fetch("/api/config");
        if (!res.ok) return;
        const cfg = await res.json();
        const root = document.documentElement;
        if (cfg?.brand?.colors?.brand600) root.style.setProperty("--brand-600", cfg.brand.colors.brand600);
        if (cfg?.brand?.colors?.brand700) root.style.setProperty("--brand-700", cfg.brand.colors.brand700);
        if (cfg?.brand?.colors?.brand800) root.style.setProperty("--brand-800", cfg.brand.colors.brand800);
        if (cfg?.brand?.colors?.pageBg) root.style.setProperty("--vanilla", cfg.brand.colors.pageBg);
      } catch {}
    })();
  }, []);
  return null;
}

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const initialLang = router.locale === "en" ? "en" : "ar";

  // دعم getLayout في الصفحات
  // @ts-expect-error getLayout اختياري وليس موجودًا في جميع الصفحات
  const getLayout = Component.getLayout as undefined | ((page: JSX.Element) => JSX.Element);

  const page = (
    <I18nProvider initialLang={initialLang}>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#0f766e" />
        <title>Ain Oman</title>
      </Head>

      {/* مزامنة اللغة مع locale */}
      <LangSyncer locale={router.locale} />

      {/* تهيئة السمات والألوان */}
      <ThemeAndBrandBoot />

      {/* مزودات اختيارية */}
      <GoogleMapsProvider>
        <CurrencyProvider>
          <ChatProvider>
            <Component {...pageProps} />
            <ChatWidget />
            <FloatingButtons />
          </ChatProvider>
        </CurrencyProvider>
      </GoogleMapsProvider>
    </I18nProvider>
  );

  return typeof getLayout === "function" ? getLayout(page) : page;
}
