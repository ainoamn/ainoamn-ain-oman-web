// src/pages/_app.tsx
import type { AppProps } from "next/app";
import Head from "next/head";
import { useRouter } from "next/router";
import React, { useEffect } from "react";
import "@/styles/globals.css";

/** i18n: استيراد متسامح مع أشكال التصدير المختلفة */
let I18nProvider: React.ComponentType<any> = ({ children }: any) => <>{children}</>;
let useI18n: any = () => ({
  t: (k: string) => k,
  dir: "rtl",
  lang: "ar",
  isDark: false,
  setLang: () => {},
  supported: ["ar", "en", "fr", "hi", "fa", "ur"],
});
try {
  const mod = require("@/lib/i18n");
  const P = mod.I18nProvider || mod.default?.I18nProvider;
  const H = mod.useI18n || mod.default?.useI18n;
  if (typeof P === "function") I18nProvider = P;
  if (typeof H === "function") useI18n = H;
} catch {}

/** مزوّدات اختيارية مع بدائل صامتة */
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

/** مزامنة لغة الراوتر و ?lang مع i18n */
function LangSync() {
  const router = useRouter();
  const { setLang, supported } = useI18n();

  useEffect(() => {
    const fromRouter = router?.locale ? router.locale.split("-")[0] : "";
    const fromUrl =
      typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("lang") || "" : "";
    const candidate = (fromUrl || fromRouter).toLowerCase();
    const list = Array.isArray(supported) && supported.length ? supported : ["ar","en","fr","hi","fa","ur"];
    if (candidate && list.includes(candidate as any)) setLang(candidate as any);
  }, [router?.locale, setLang, supported]);

  return null;
}

export default function App({ Component, pageProps }: AppProps) {
  // @ts-expect-error دعم getLayout إن وُجد
  const getLayout = Component.getLayout as undefined | ((page: JSX.Element) => JSX.Element);
  const page = <Component {...pageProps} />;

  return (
    <I18nProvider>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#0f766e" />
        <title>Ain Oman</title>
      </Head>

      <LangSync />

      <GoogleMapsProvider>
        <CurrencyProvider>
          <ChatProvider>
            {typeof getLayout === "function" ? getLayout(page) : page}
            <ChatWidget />
            <FloatingButtons />
          </ChatProvider>
        </CurrencyProvider>
      </GoogleMapsProvider>
    </I18nProvider>
  );
}
