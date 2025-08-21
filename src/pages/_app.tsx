// src/pages/_app.tsx
import type { AppProps } from "next/app";
import Head from "next/head";
import { useRouter } from "next/router";
import React, { useEffect } from "react";

// أنماط المشروع العامة (styles موجود في جذر المشروع)
import "../../styles/globals.css";

// مزوّد الترجمة لديك (أو بديل خفيف)
let I18nProvider: any = ({ children, initialLang }: any) => <>{children}</>;
let useI18n: any = () => ({ setLang: (_: string) => {} });
try {
  const m = require("@/lib/i18n");
  I18nProvider = m.I18nProvider || I18nProvider;
  useI18n = m.useI18n || useI18n;
} catch {}

// بقية المزوّدات مع بدائل صامتة
let GoogleMapsProvider: any = ({ children }: any) => <>{children}</>;
try { GoogleMapsProvider = require("../components/maps/GoogleMapsProvider").default || GoogleMapsProvider; } catch {}

let CurrencyProvider: any = ({ children }: any) => <>{children}</>;
try { CurrencyProvider = require("../context/CurrencyContext").CurrencyProvider || CurrencyProvider; } catch {}

let ChatProvider: any = ({ children }: any) => <>{children}</>;
let ChatWidget: any = () => null;
let FloatingButtons: any = () => null;
try { ChatProvider = require("../context/ChatContext").ChatProvider || ChatProvider; } catch {}
try { ChatWidget = require("../components/chat/ChatWidget").default || ChatWidget; } catch {}
try { FloatingButtons = require("../components/floating/FloatingButtons").default || FloatingButtons; } catch {}

function LangSyncer({ locale }: { locale?: string }) {
  const { setLang } = useI18n();
  useEffect(() => {
    if (locale === "ar" || locale === "en") setLang(locale);
  }, [locale, setLang]);
  return null;
}

function ThemeAndBrandBoot() {
  useEffect(() => {
    // تفعيل الثيم وتلوين العلامة إن وُجدت إعدادات
    try {
      const saved = localStorage.getItem("theme");
      const prefersDark = typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
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
        if (cfg?.brand?.colors?.pageBg)  root.style.setProperty("--vanilla",  cfg.brand.colors.pageBg);
      } catch {}
    })();
  }, []);
  return null;
}

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const initialLang = router.locale === "en" ? "en" : "ar";

  // دعم getLayout إن وُجد (الصفحة/الليّاوت هو المسؤول عن الهيدر/الفوتر)
  // @ts-expect-error
  const getLayout = Component.getLayout as undefined | ((page: JSX.Element) => JSX.Element);
  const PageEl = <Component {...pageProps} />;

  return (
    <I18nProvider initialLang={initialLang}>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#0f766e" />
        <title>Ain Oman</title>
      </Head>

      <LangSyncer locale={router.locale} />
      <ThemeAndBrandBoot />

      <GoogleMapsProvider>
        <CurrencyProvider>
          <ChatProvider>
            {/* ملاحظة مهمّة:
               - لا نضيف أي Header/Footer هنا إطلاقًا.
               - إن كانت الصفحة تملك getLayout فستُلف هناك.
               - وإلا ستُعرض مباشرة كما هي، والصفحة/ليّاوتها هو من يضيف الهيدر/الفوتر. */}
            {typeof getLayout === "function" ? getLayout(PageEl) : PageEl}

            {/* عناصر عامة عائمة */}
            <ChatWidget />
            <FloatingButtons />
          </ChatProvider>
        </CurrencyProvider>
      </GoogleMapsProvider>
    </I18nProvider>
  );
}
