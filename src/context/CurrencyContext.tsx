// src/context/CurrencyContext.tsx
import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";

type Currency = "OMR" | "AED" | "SAR" | "USD";
type Rates = Record<Currency, number>;

type Ctx = {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  rates: Rates;
  convert: (amountInOMR: number, to?: Currency) => number;
  format: (amountInOMR: number, to?: Currency) => string;
};

// ⭐ نثبّت دائمًا نظام الأرقام إلى اللاتيني (latn) لتجنّب عدم التطابق
const LOCALE_FOR_NUMBERS = "ar-EG-u-nu-latn";
// يمكنك تغييره إلى "ar-EG-u-nu-arab" لو أردت أرقامًا عربية (١٢٣) في كل مكان، المهم الثبات في الجهتين.

const CurrencyContext = createContext<Ctx | null>(null);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrency] = useState<Currency>("OMR");
  const [rates, setRates] = useState<Rates>({ OMR: 1, AED: 9.55, SAR: 9.75, USD: 2.60 });

  useEffect(() => {
    fetch("/api/exchange")
      .then(r => r.json())
      .then((data) => { if (data?.rates) setRates(data.rates); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("currency") as Currency | null;
      if (saved) setCurrency(saved);
    }
  }, []);
  useEffect(() => {
    if (typeof window !== "undefined") localStorage.setItem("currency", currency);
  }, [currency]);

  const convert = (amountInOMR: number, to: Currency = currency) => {
    const rate = rates[to] ?? 1;
    return amountInOMR * rate;
  };

  const format = (amountInOMR: number, to: Currency = currency) => {
    const val = convert(amountInOMR, to);
    const symbol: Record<Currency, string> = { OMR: "ر.ع", AED: "د.إ", SAR: "ر.س", USD: "$" };
    // ❗ بدلاً من toLocaleString(undefined, ...) نستخدم Intl ثابت بنفس locale
    const nf = new Intl.NumberFormat(LOCALE_FOR_NUMBERS, { maximumFractionDigits: 2 });
    return `${nf.format(val)} ${symbol[to]}`;
  };

  const value = useMemo(() => ({ currency, setCurrency, rates, convert, format }), [currency, rates]);
  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used within CurrencyProvider");
  return ctx;
}
