// src/contexts/CustomizationContext.tsx
"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

export type MenuItem = { label: string; href: string };
export type SectionLink = { label: string; href: string };
export type FooterSection = { title: string; links: SectionLink[] };
export type Partner = { name: string; logo?: string; url?: string };
export type PaymentMethod = { name: string; icon?: string };
export type Notification = { id: string; message: string; visible: boolean };

export type HeaderSettings = {
  backgroundColor: string;
  textColor: string;
  logo: string;
  menuItems: MenuItem[];
  showSearch: boolean;
  showLanguageSelector: boolean;
  showCurrencySelector: boolean;
  showThemeToggle: boolean;
  notifications: Notification[];
};

export type FooterSettings = {
  backgroundColor: string;
  textColor: string;
  transparency: number; // 0..100
  sections: FooterSection[];
  partners: Partner[];
  paymentMethods: PaymentMethod[];
  contactInfo: { email: string; phone: string; address: string };
};

type CtxShape = {
  header: HeaderSettings;
  footer: FooterSettings;
  isHeaderHidden: boolean;
  updateHeader: (p: Partial<HeaderSettings>) => void;
  updateFooter: (p: Partial<FooterSettings>) => void;
  addNotification: (message: string) => void;
  removeNotification: (id: string) => void;
};

const defaultHeader: HeaderSettings = {
  backgroundColor: "#0d9488",
  textColor: "#ffffff",
  logo: "/logo.png",
  menuItems: [
    { label: "الرئيسية", href: "/" },
    { label: "العقارات", href: "/properties" },
    { label: "المزادات", href: "/auctions" },
  ],
  showSearch: true,
  showLanguageSelector: true,
  showCurrencySelector: true,
  showThemeToggle: true,
  notifications: [],
};

const defaultFooter: FooterSettings = {
  backgroundColor: "#0d9488",
  textColor: "#ffffff",
  transparency: 70,
  sections: [
    { title: "عن المنصة", links: [{ label: "من نحن", href: "/about" }, { label: "اتصل بنا", href: "/contact" }] },
    { title: "خدماتنا", links: [{ label: "العقارات", href: "/properties" }, { label: "المزادات", href: "/auctions" }] },
  ],
  partners: [],
  paymentMethods: [],
  contactInfo: { email: "info@example.com", phone: "+968 00 000 000", address: "مسقط، عُمان" },
};

const LocalKeys = {
  header: "hf.header.v1",
  footer: "hf.footer.v1",
};

const CustomizationContext = createContext<CtxShape | undefined>(undefined);

export function CustomizationProvider({ children }: { children: ReactNode }) {
  const [header, setHeader] = useState<HeaderSettings>(defaultHeader);
  const [footer, setFooter] = useState<FooterSettings>(defaultFooter);
  const [isHeaderHidden, setIsHeaderHidden] = useState(false);
  const lastY = useRef(0);

  // load from localStorage + merge remote
  useEffect(() => {
    try {
      const h = typeof window !== "undefined" ? localStorage.getItem(LocalKeys.header) : null;
      const f = typeof window !== "undefined" ? localStorage.getItem(LocalKeys.footer) : null;
      if (h) setHeader({ ...defaultHeader, ...JSON.parse(h) });
      if (f) setFooter({ ...defaultFooter, ...JSON.parse(f) });
    } catch {}
    (async () => {
      try {
        const r = await fetch("/api/header-footer");
        if (r.ok) {
          const j = await r.json();
          if (j?.header) setHeader((old) => ({ ...old, ...j.header }));
          if (j?.footer) setFooter((old) => ({ ...old, ...j.footer }));
        }
      } catch {}
    })();
  }, []);

  // inject CSS variables
  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    try {
      root.style.setProperty("--brand-600", header.backgroundColor);
      root.style.setProperty("--footer-opacity", String(Math.max(0, Math.min(1, footer.transparency / 100))));
    } catch {}
  }, [header.backgroundColor, footer.transparency]);

  // hide header on scroll down
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setIsHeaderHidden(y > lastY.current && y > 20);
      lastY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const persist = async (h: HeaderSettings, f: FooterSettings) => {
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem(LocalKeys.header, JSON.stringify(h));
        localStorage.setItem(LocalKeys.footer, JSON.stringify(f));
      }
    } catch {}
    try {
      await fetch("/api/header-footer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ header: h, footer: f }),
      });
    } catch {}
  };

  const updateHeader = (p: Partial<HeaderSettings>) => {
    setHeader((old) => {
      const next = { ...old, ...p };
      void persist(next, footer);
      return next;
    });
  };

  const updateFooter = (p: Partial<FooterSettings>) => {
    setFooter((old) => {
      const next = { ...old, ...p };
      void persist(header, next);
      return next;
    });
  };

  const addNotification = (message: string) => {
    const id = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : String(Date.now());
    updateHeader({ notifications: [...header.notifications, { id, message, visible: true }] });
  };

  const removeNotification = (id: string) => {
    updateHeader({ notifications: header.notifications.filter((n) => n.id !== id) });
  };

  return (
    <CustomizationContext.Provider
      value={{ header, footer, isHeaderHidden, updateHeader, updateFooter, addNotification, removeNotification }}
    >
      {children}
    </CustomizationContext.Provider>
  );
}

export function useCustomization() {
  const ctx = useContext(CustomizationContext);
  if (!ctx) throw new Error("useCustomization must be used within CustomizationProvider");
  return ctx;
}

export default CustomizationProvider;
