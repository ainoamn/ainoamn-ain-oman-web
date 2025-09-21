// src/pages/_app.tsx
import type { AppProps } from "next/app";
import Head from "next/head";
import { useRouter } from "next/router";
import React, { useEffect } from "react";
import "@/styles/globals.css";
import { initializeData } from "@/utils/initData";
import MainLayout from "@/components/layout/MainLayout";
import { CustomizationProvider } from "@/contexts/CustomizationContext";

// ThemeProvider (إن وُجد)
let ThemeProvider: React.ComponentType<any> = ({ children }: any) => <>{children}</>;
try {
  const mod = require("@/context/ThemeContext");
  ThemeProvider = mod.ThemeProvider || mod.default?.ThemeProvider || ThemeProvider;
} catch {}

// i18n (إن وُجد)
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

  return (
    <ThemeProvider>
      <I18nProvider>
        <CustomizationProvider>
          <AuthProvider>
            <Head>
              <meta name="viewport" content="width=device-width, initial-scale=1" />
              <meta name="theme-color" content="#0f766e" />
              <title>Ain Oman</title>
            </Head>

            <LangSync />

            <GoogleMapsProvider>
              <CurrencyProvider>
                <ChatProvider>
                  {noChrome
                    ? page
                    : getLayout
                    ? getLayout(page) // تخطيط مخصص للصفحة
                    : <MainLayout>{page}</MainLayout> /* الغلاف الافتراضي بهيدر/فوتر المحسّنين */}
                  <ChatWidget />
                  <FloatingButtons />
                </ChatProvider>
              </CurrencyProvider>
            </GoogleMapsProvider>
          </AuthProvider>
        </CustomizationProvider>
      </I18nProvider>
    </ThemeProvider>
  );
}
