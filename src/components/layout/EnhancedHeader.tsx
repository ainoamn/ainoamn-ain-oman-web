// src/components/layout/EnhancedHeader.tsx
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Bars3Icon, XMarkIcon, MoonIcon, SunIcon, XCircleIcon } from "@heroicons/react/24/outline";
import { useCustomization } from "@/contexts/CustomizationContext";

type Theme = "light" | "dark";
type Currency = "OMR" | "AED" | "SAR" | "USD";

export default function EnhancedHeader() {
  const { header, isHeaderHidden, removeNotification } = useCustomization();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [theme, setTheme] = useState<Theme>("light");
  const [currency, setCurrency] = useState<Currency>("OMR");

  // SSR-safe: read from localStorage after mount
  useEffect(() => {
    try {
      const prefersDark =
        typeof window !== "undefined" &&
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches;

      const savedTheme = (typeof window !== "undefined" ? localStorage.getItem("theme") : null) as Theme | null;
      const nextTheme: Theme = savedTheme || (prefersDark ? "dark" : "light");
      setTheme(nextTheme);
      if (typeof document !== "undefined") {
        document.documentElement.classList.toggle("dark", nextTheme === "dark");
      }

      const savedCurrency = (typeof window !== "undefined" ? localStorage.getItem("currency") : null) as Currency | null;
      if (savedCurrency) setCurrency(savedCurrency);
    } catch {}
  }, []);

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    try {
      if (typeof document !== "undefined") {
        document.documentElement.classList.toggle("dark", next === "dark");
      }
      if (typeof window !== "undefined") {
        localStorage.setItem("theme", next);
      }
    } catch {}
  };

  const onChangeCurrency = (val: string) => {
    const v = (val as Currency) || "OMR";
    setCurrency(v);
    try {
      if (typeof window !== "undefined") localStorage.setItem("currency", v);
    } catch {}
  };

  const visibleNotifications = Array.isArray(header?.notifications)
    ? header.notifications.filter((n) => n?.visible !== false).slice(-1)
    : [];

  return (
    <div className={`sticky top-0 z-50 transition-transform duration-300 ${isHeaderHidden ? "-translate-y-full" : "translate-y-0"}`}>
      {/* إشعار علوي قابل للإغلاق */}
      {visibleNotifications.map((n) => (
        <div key={n.id} className="bg-amber-500 text-white">
          <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-6 py-2 flex items-center justify-between">
            <span className="text-sm">{n.message}</span>
            <button onClick={() => removeNotification(n.id)} aria-label="close" className="p-1 rounded hover:bg-black/10">
              <XCircleIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      ))}

      <header
        className="border-b"
        style={{
          backgroundColor: header?.backgroundColor || "#0d9488",
          color: header?.textColor || "#ffffff",
          borderColor: "rgba(255,255,255,0.2)",
        }}
      >
        <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-6">
          <div className="flex items-center justify-between py-3">
            <Link href="/" className="flex items-center gap-2">
              <img src={header?.logo || "/logo.png"} alt="logo" className="w-9 h-9 object-contain" />
              <span className="text-2xl font-black tracking-tight opacity-90">عين عُمان</span>
            </Link>

            <nav className="hidden lg:flex items-center gap-1">
              {(header?.menuItems || []).map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="px-3 py-2 rounded-xl font-medium transition-all hover:shadow hover:ring-2 hover:ring-white/30"
                  style={{ opacity: 0.9 }}
                >
                  {item.label}
                </Link>
              ))}

              {header?.showSearch && (
                <div className="ms-2">
                  <input
                    type="text"
                    placeholder="بحث..."
                    className="px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50"
                  />
                </div>
              )}
            </nav>

            <div className="hidden lg:flex items-center gap-2">
              {header?.showLanguageSelector && (
                <select className="text-sm rounded-xl border border-white/25 bg-white/10 px-2 py-1.5 text-white focus:outline-none focus:ring-2 focus:ring-white/50" defaultValue="ar">
                  <option value="ar">العربية</option>
                  <option value="en">English</option>
                </select>
              )}

              {header?.showCurrencySelector && (
                <select
                  value={currency}
                  onChange={(e) => onChangeCurrency(e.target.value)}
                  className="text-sm rounded-xl border border-white/25 bg-white/10 px-2 py-1.5 text-white focus:outline-none focus:ring-2 focus:ring-white/50"
                >
                  <option value="OMR">OMR</option>
                  <option value="AED">AED</option>
                  <option value="SAR">SAR</option>
                  <option value="USD">USD</option>
                </select>
              )}

              {header?.showThemeToggle && (
                <button onClick={toggleTheme} className="p-2 rounded-xl border border-white/25 text-white hover:ring-2 hover:ring-white/30">
                  {theme === "light" ? <MoonIcon className="w-5 h-5" /> : <SunIcon className="w-5 h-5" />}
                </button>
              )}
            </div>

            <button
              onClick={() => setMobileOpen((s) => !s)}
              className="lg:hidden p-2 rounded-xl border border-white/25 text-white"
              aria-label="menu"
            >
              {mobileOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="lg:hidden border-t border-white/20 bg-white text-gray-800">
            <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-6 py-3 space-y-1">
              {(header?.menuItems || []).map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2 rounded-xl font-medium hover:bg-teal-50 hover:text-teал-700"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </header>
    </div>
  );
}
