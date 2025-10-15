import type { AppProps } from "next/app";
import Head from "next/head";
import { useRouter } from "next/router";
import React, { useEffect } from "react";
import "@/styles/globals.css";
import { initializeData } from "@/utils/initData";
import MainLayout from "@/components/layout/MainLayout";
import { CustomizationProvider } from "@/contexts/CustomizationContext";
import Sanitize from "@/lib/react-sanitize-children";

// ThemeProvider
import { ThemeProvider } from "@/context/ThemeContext";

// i18n (اختياري إن وُجد)
let I18nProvider: React.ComponentType<any> = ({ children }: any) => <>{children}</>;
let useI18n: any = () => ({ t: (k: string) => k, dir: "rtl", lang: "ar", setLang: () => {}, supported: ["ar","en"] });
try {
  const mod = require("@/lib/i18n");
  const P = mod.I18nProvider || mod.default?.I18nProvider;
  const H = mod.useI18n || mod.default?.useI18n;
  if (typeof P === "function") I18nProvider = P;
  if (typeof H === "function") useI18n = H;
} catch {}

// مزوّدات اختيارية
let GoogleMapsProvider: any = ({ children }: any) => <>{children}</>;
let CurrencyProvider: any = ({ children }: any) => <>{children}</>;
let ChatProvider: any = ({ children }: any) => <>{children}</>;
let ChatWidget: any = () => null;
let FloatingButtons: any = () => null;
try { GoogleMapsProvider = require("@/components/maps/GoogleMapsProvider").default || GoogleMapsProvider; } catch {}
try { CurrencyProvider = require("@/context/CurrencyContext").CurrencyProvider || CurrencyProvider; } catch {}
try { ChatProvider = require("@/context/ChatContext").ChatProvider || ChatProvider; } catch {}
try { ChatWidget = require("@/components/chat/ChatWidget").default || ChatWidget; } catch {}
try { FloatingButtons = require("@/components/floating/FloatingButtons").default || FloatingButtons; } catch {}

// Auth
import { AuthProvider } from "@/context/AuthContext";

// Performance Provider للتنقل الفوري ⚡
let PerformanceProvider: any = ({ children }: any) => <>{children}</>;
try {
  const mod = require("@/context/PerformanceContext");
  PerformanceProvider = mod.PerformanceProvider || PerformanceProvider;
} catch {}

// Bookings Provider للحجوزات الموحدة ⚡
let BookingsProvider: any = ({ children }: any) => <>{children}</>;
try {
  const mod = require("@/context/BookingsContext");
  BookingsProvider = mod.BookingsProvider || BookingsProvider;
} catch {}

// Subscription Provider للاشتراكات والصلاحيات 🔐
let SubscriptionProvider: any = ({ children }: any) => <>{children}</>;
try {
  const mod = require("@/context/SubscriptionContext");
  SubscriptionProvider = mod.SubscriptionProvider || SubscriptionProvider;
} catch {}

// Notifications Provider للإشعارات 🔔
let NotificationsProvider: any = ({ children }: any) => <>{children}</>;
try {
  const mod = require("@/context/NotificationsContext");
  NotificationsProvider = mod.NotificationsProvider || NotificationsProvider;
} catch {}

// مزامنة اللغة
function LangSync() {
  const router = useRouter();
  const { setLang, supported } = useI18n();
  useEffect(() => {
    const fromRouter = router?.locale ? router.locale.split("-")[0] : "";
    const fromUrl =
      typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("lang") || "" : "";
    const cand = (fromUrl || fromRouter).toLowerCase();
    const list = Array.isArray(supported) && supported.length ? supported : ["ar", "en"];
    if (cand && list.includes(cand as any)) setLang(cand as any);
  }, [router?.locale, setLang, supported]);
  return null;
}

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    initializeData();
  }, []);

  // @ts-expect-error optional getLayout / noChrome
  const getLayout = (Component as any).getLayout as undefined | ((page: JSX.Element) => JSX.Element);
  // @ts-expect-error optional flag
  const noChrome = (Component as any)?.noChrome === true;

  const page = <Component {...pageProps} />;

  const base =
    noChrome
      ? page
      : getLayout
      ? getLayout(page)
      : <MainLayout>{page}</MainLayout>;

  const content = <Sanitize locale="ar">{base}</Sanitize>;

  return (
    <PerformanceProvider>
      <ThemeProvider>
        <I18nProvider>
          <CustomizationProvider>
            <AuthProvider>
              <Head>
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <meta name="theme-color" content="#0f766e" />
                
                {/* PWA Meta Tags */}
                <meta name="application-name" content="عين عُمان" />
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-status-bar-style" content="default" />
                <meta name="apple-mobile-web-app-title" content="عين عُمان" />
                <meta name="description" content="منصة العقارات الذكية في عُمان" />
                <meta name="format-detection" content="telephone=no" />
                <meta name="mobile-web-app-capable" content="yes" />
                
                {/* Performance Hints */}
                <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="anonymous" />
                
                {/* Manifest */}
                <link rel="manifest" href="/manifest.json" />
                
                {/* Icons */}
                <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
                <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
                <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
                
                <title>عين عُمان - منصة العقارات الذكية</title>
              </Head>

              <LangSync />

              <GoogleMapsProvider>
                <CurrencyProvider>
                  <SubscriptionProvider>
                    <BookingsProvider>
                      <NotificationsProvider>
                        <ChatProvider>
                          {content}
                          <ChatWidget />
                          <FloatingButtons />
                        </ChatProvider>
                      </NotificationsProvider>
                    </BookingsProvider>
                  </SubscriptionProvider>
                </CurrencyProvider>
              </GoogleMapsProvider>
            </AuthProvider>
          </CustomizationProvider>
        </I18nProvider>
      </ThemeProvider>
    </PerformanceProvider>
  );
}
