// src/context/CurrencyContext-enhanced.tsx - نظام العملات المحسّن
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

// العملات المدعومة
export type SupportedCurrency = 
  | "OMR"  // الريال العماني (الأساسية)
  | "AED"  // الدرهم الإماراتي
  | "SAR"  // الريال السعودي
  | "BHD"  // الدينار البحريني
  | "KWD"  // الدينار الكويتي
  | "QAR"  // الريال القطري
  | "USD"; // الدولار الأمريكي

// معلومات العملات
export const CURRENCIES: Record<SupportedCurrency, {
  name: string;
  symbol: string;
  code: string;
  country: string;
  flag: string;
  exchangeRate?: number; // سعر الصرف مقابل OMR
}> = {
  OMR: {
    name: "Omani Rial",
    symbol: "ر.ع",
    code: "OMR",
    country: "Oman",
    flag: "🇴🇲",
    exchangeRate: 1, // العملة الأساسية
  },
  AED: {
    name: "UAE Dirham",
    symbol: "د.إ",
    code: "AED",
    country: "UAE",
    flag: "🇦🇪",
    exchangeRate: 0.104, // تقريبي: 1 OMR = 9.6 AED
  },
  SAR: {
    name: "Saudi Riyal",
    symbol: "ر.س",
    code: "SAR",
    country: "Saudi Arabia",
    flag: "🇸🇦",
    exchangeRate: 0.102, // تقريبي: 1 OMR = 9.8 SAR
  },
  BHD: {
    name: "Bahraini Dinar",
    symbol: ".د.ب",
    code: "BHD",
    country: "Bahrain",
    flag: "🇧🇭",
    exchangeRate: 1.02, // تقريبي: 1 OMR = 0.98 BHD
  },
  KWD: {
    name: "Kuwaiti Dinar",
    symbol: "د.ك",
    code: "KWD",
    country: "Kuwait",
    flag: "🇰🇼",
    exchangeRate: 1.28, // تقريبي: 1 OMR = 0.78 KWD
  },
  QAR: {
    name: "Qatari Riyal",
    symbol: "ر.ق",
    code: "QAR",
    country: "Qatar",
    flag: "🇶🇦",
    exchangeRate: 0.102, // تقريبي: 1 OMR = 9.8 QAR
  },
  USD: {
    name: "US Dollar",
    symbol: "$",
    code: "USD",
    country: "USA",
    flag: "🇺🇸",
    exchangeRate: 0.385, // تقريبي: 1 OMR = 2.6 USD
  },
};

export const SUPPORTED_CURRENCIES: SupportedCurrency[] = [
  "OMR", "AED", "SAR", "BHD", "KWD", "QAR", "USD"
];

type CurrencyContextType = {
  currency: SupportedCurrency;
  setCurrency: (c: SupportedCurrency) => void;
  format: (amount: number, targetCurrency?: SupportedCurrency) => string;
  convert: (amount: number, from: SupportedCurrency, to: SupportedCurrency) => number;
  getCurrencyInfo: (c: SupportedCurrency) => typeof CURRENCIES[SupportedCurrency];
};

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

// تحديد العملة الأولية
function getInitialCurrency(): SupportedCurrency {
  if (typeof window === "undefined") return "OMR";
  
  const saved = localStorage.getItem("currency") as SupportedCurrency | null;
  if (saved && SUPPORTED_CURRENCIES.includes(saved)) {
    return saved;
  }
  
  // محاولة التخمين من الموقع الجغرافي
  if (typeof navigator !== "undefined" && navigator.language) {
    const lang = navigator.language.toLowerCase();
    if (lang.includes("om")) return "OMR";
    if (lang.includes("ae")) return "AED";
    if (lang.includes("sa")) return "SAR";
    if (lang.includes("bh")) return "BHD";
    if (lang.includes("kw")) return "KWD";
    if (lang.includes("qa")) return "QAR";
    if (lang.includes("us") || lang.includes("en-us")) return "USD";
  }
  
  return "OMR";
}

export function EnhancedCurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<SupportedCurrency>(getInitialCurrency());
  const [exchangeRates, setExchangeRates] = useState<Record<SupportedCurrency, number>>(() => {
    const rates: Record<string, number> = {};
    Object.entries(CURRENCIES).forEach(([code, info]) => {
      rates[code] = info.exchangeRate || 1;
    });
    return rates as Record<SupportedCurrency, number>;
  });

  // تحديث أسعار الصرف (يمكن جلبها من API)
  useEffect(() => {
    const updateExchangeRates = async () => {
      try {
        // يمكن جلب الأسعار من API
        // const response = await fetch('/api/exchange-rates');
        // if (response.ok) {
        //   const rates = await response.json();
        //   setExchangeRates(rates);
        // }
      } catch (error) {
        console.warn('Failed to update exchange rates:', error);
      }
    };
    
    updateExchangeRates();
    // تحديث كل ساعة
    const interval = setInterval(updateExchangeRates, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("currency", currency);
    }
  }, [currency]);

  // تنسيق المبلغ
  const format = useMemo(() => {
    return (amount: number, targetCurrency?: SupportedCurrency): string => {
      const target = targetCurrency || currency;
      const info = CURRENCIES[target];
      
      // تحويل المبلغ إذا لزم الأمر
      let convertedAmount = amount;
      if (targetCurrency && targetCurrency !== currency) {
        convertedAmount = convert(amount, currency, targetCurrency);
      }
      
      try {
        // استخدام Intl.NumberFormat للتنسيق
        const locale = target === "USD" ? "en-US" : 
                      target === "OMR" ? "ar-OM" :
                      target === "AED" ? "ar-AE" :
                      target === "SAR" ? "ar-SA" :
                      target === "BHD" ? "ar-BH" :
                      target === "KWD" ? "ar-KW" :
                      target === "QAR" ? "ar-QA" : "en-US";
        
        const formatter = new Intl.NumberFormat(locale, {
          style: "currency",
          currency: target,
          minimumFractionDigits: target === "OMR" ? 3 : 2,
          maximumFractionDigits: target === "OMR" ? 3 : 2,
        });
        
        return formatter.format(convertedAmount);
      } catch (error) {
        // Fallback
        return `${convertedAmount.toFixed(3)} ${info.symbol}`;
      }
    };
  }, [currency]);

  // تحويل العملة
  const convert = useMemo(() => {
    return (amount: number, from: SupportedCurrency, to: SupportedCurrency): number => {
      if (from === to) return amount;
      
      // تحويل إلى OMR أولاً
      const inOMR = from === "OMR" 
        ? amount 
        : amount / (exchangeRates[from] || 1);
      
      // تحويل من OMR إلى العملة المستهدفة
      const result = to === "OMR"
        ? inOMR
        : inOMR * (exchangeRates[to] || 1);
      
      return Math.round(result * 1000) / 1000; // دقة 3 أرقام عشرية
    };
  }, [exchangeRates]);

  const getCurrencyInfo = (c: SupportedCurrency) => CURRENCIES[c];

  const value: CurrencyContextType = useMemo(
    () => ({
      currency,
      setCurrency: (c: SupportedCurrency) => {
        if (SUPPORTED_CURRENCIES.includes(c)) {
          setCurrencyState(c);
        }
      },
      format,
      convert,
      getCurrencyInfo,
    }),
    [currency, format, convert]
  );

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) {
    // Fallback
    return {
      currency: "OMR" as SupportedCurrency,
      setCurrency: () => {},
      format: (amount: number) => `${amount.toFixed(3)} ر.ع`,
      convert: (amount: number) => amount,
      getCurrencyInfo: (c: SupportedCurrency) => CURRENCIES[c],
    };
  }
  return ctx;
}






