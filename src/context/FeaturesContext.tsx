import React, { createContext, useContext, useEffect, useState } from "react";

export type FeatureFlags = {
  aiAssistant: boolean;
  maps: boolean;
  analytics: boolean;
  media: boolean;
  attachments: boolean;
  paymentPlans: boolean;
  units: boolean;
  webhooks: boolean;
  externalLinks: boolean;
  theming: boolean;
};

export type AppConfig = {
  plan: "free" | "pro" | "enterprise";
  features: FeatureFlags;
  brand?: {
    colors?: { brand600?: string; brand700?: string; brand800?: string; pageBg?: string };
    logoUrl?: string;
  };
  webhooks?: string[];
};

const defaultConfig: AppConfig = {
  plan: "pro",
  features: {
    aiAssistant: true,
    maps: true,
    analytics: true,
    media: true,
    attachments: true,
    paymentPlans: true,
    units: true,
    webhooks: true,
    externalLinks: true,
    theming: true
  },
  brand: {},
  webhooks: []
};

const Ctx = createContext<{ config: AppConfig; refresh: () => void }>({ config: defaultConfig, refresh: () => {} });

export function FeaturesProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<AppConfig>(defaultConfig);

  const load = async () => {
    try {
      const r = await fetch("/api/config", { cache: "no-store" });
      const j = await r.json();
      setConfig(j?.config || defaultConfig);
      const root = document.documentElement as any;
      const c = j?.config?.brand?.colors || {};
      if (c.brand600) root.style.setProperty("--brand-600", c.brand600);
      if (c.brand700) root.style.setProperty("--brand-700", c.brand700);
      if (c.brand800) root.style.setProperty("--brand-800", c.brand800);
      if (c.pageBg)  root.style.setProperty("--vanilla",  c.pageBg);
    } catch (_e) {}
  };

  useEffect(() => { load(); }, []);

  return <Ctx.Provider value={{ config, refresh: load }}>{children}</Ctx.Provider>;
}

export function useFeatures() {
  const { config } = useContext(Ctx);
  return { plan: config.plan, f: config.features, brand: config.brand, webhooks: config.webhooks || [] };
}
