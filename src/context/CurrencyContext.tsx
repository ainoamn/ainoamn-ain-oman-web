// src/context/CurrencyContext.tsx
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

export type Currency = "OMR" | "AED" | "SAR" | "USD";

type Ctx = {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  format: (n: number) => string;
};

const CurrencyContext = createContext<Ctx | undefined>(undefined);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrency] = useState<Currency>("OMR");

  // لا نقرأ التخزين أثناء SSR
  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = (localStorage.getItem("currency") as Currency | null) || null;
    if (saved) setCurrency(saved);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") localStorage.setItem("currency", currency);
  }, [currency]);

  const fmt = useMemo(() => ({
    OMR: new Intl.NumberFormat("ar-OM", { style: "currency", currency: "OMR", maximumFractionDigits: 3 }),
    AED: new Intl.NumberFormat("ar-AE", { style: "currency", currency: "AED" }),
    SAR: new Intl.NumberFormat("ar-SA", { style: "currency", currency: "SAR" }),
    USD: new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }),
  }), []);

  const format = (n: number) => fmt[currency as keyof typeof fmt].format(n);

  const value = useMemo<Ctx>(() => ({ currency, setCurrency, format }), [currency, fmt]);

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used within CurrencyProvider");
  return ctx;
}
