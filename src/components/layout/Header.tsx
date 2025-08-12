// src/components/layout/Header.tsx
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { Bars3Icon, XMarkIcon, ChevronDownIcon, SunIcon, MoonIcon, UserIcon } from "@heroicons/react/24/outline";
import { getT } from "../../lib/i18n";

type Theme = "light" | "dark";
type Currency = "OMR" | "AED" | "SAR" | "USD";

const LogoMark = ({ className = "w-9 h-9" }: { className?: string }) => (
  <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
    <path d="M8 26L24 10l16 16v10a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2V26Z" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
    <path d="M18 38V26h12v12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
  </svg>
);

export default function Header() {
  const router = useRouter();
  const tt = getT(router);

  const [theme, setTheme] = useState<Theme>("light");
  const [currency, setCurrency] = useState<Currency>("OMR");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [hiddenOnScroll, setHiddenOnScroll] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const savedTheme = (localStorage.getItem("theme") as Theme) || null;
    const initialTheme = savedTheme ?? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    setTheme(initialTheme);
    document.documentElement.classList.toggle("dark", initialTheme === "dark");

    const savedCurrency = (localStorage.getItem("currency") as Currency) || "OMR";
    setCurrency(savedCurrency);

    const onScroll = () => {
      const y = window.scrollY;
      const goingDown = y > lastY.current && y > 20;
      setHiddenOnScroll(goingDown);
      lastY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const toggleTheme = () => {
    const next: Theme = theme === "light" ? "dark" : "light";
    setTheme(next);
    document.documentElement.classList.toggle("dark", next === "dark");
    if (typeof window !== "undefined") localStorage.setItem("theme", next);
  };

  const changeLocale = async (value: string) => {
    localStorage.setItem("locale", value);
    try { await router.push(router.pathname, router.asPath, { locale: value }); } catch {}
  };

  const changeCurrency = (value: Currency) => {
    setCurrency(value);
    if (typeof window !== "undefined") localStorage.setItem("currency", value);
  };

  const links = [
    { href: "/", label: tt("nav.home") },
    { href: "/search", label: tt("nav.search") },
    { href: "/properties", label: tt("nav.properties") },
    { href: "/auctions", label: tt("nav.auctions") },
    { href: "/companies", label: tt("nav.companies") },
  ];

  return (
    <div className={`sticky top-0 z-50 transition-transform duration-300 ${hiddenOnScroll ? "-translate-y-full" : "translate-y-0"}`}>
      <header className="brand-bg border-b" style={{ borderColor: "var(--brand-700)" }}>
        <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-6">
          <div className="flex items-center justify-between py-3">
            <Link href="/" className="flex items-center gap-2 group" aria-label={tt("nav.home")}>
              <span className="text-white group-hover:scale-105 transition-transform"><LogoMark /></span>
              <span className="text-2xl font-black tracking-tight text-white/90 group-hover:text-white">{tt("brand.name")}</span>
            </Link>

            <nav className="hidden lg:flex items-center gap-1">
              {links.map((l) => (
                <Link key={l.href} href={l.href}
                  className="px-3 py-2 rounded-xl font-medium text-white/90 hover:text-white transition-all duration-200 hover:shadow hover:shadow-black/10 hover:ring-2 hover:ring-white/30">
                  {l.label}
                </Link>
              ))}
              <div className="relative">
                <button
                  onClick={() => setMoreOpen((s) => !s)}
                  onBlur={() => setTimeout(() => setMoreOpen(false), 150)}
                  className="flex items-center gap-1 px-3 py-2 rounded-xl font-medium text-white/90 hover:text-white transition-all duration-200 hover:shadow hover:shadow-black/10 hover:ring-2 hover:ring-white/30">
                  {tt("nav.more")} <ChevronDownIcon className="w-4 h-4" />
                </button>
                {moreOpen && (
                  <div className="absolute end-0 mt-2 w-56 rounded-xl border border-white/15 bg-white text-gray-800 shadow-lg p-2">
                    <Link href="/about" className="block px-3 py-2 rounded-lg text-sm hover:bg-teal-50 hover:text-teal-700 transition-colors">About / من نحن</Link>
                    <Link href="/contact" className="block px-3 py-2 rounded-lg text-sm hover:bg-teal-50 hover:text-teal-700 transition-colors">Contact / تواصل</Link>
                    <Link href="/pricing" className="block px-3 py-2 rounded-lg text-sm hover:bg-teal-50 hover:text-teal-700 transition-colors">Pricing / الأسعار</Link>
                    <Link href="/policies" className="block px-3 py-2 rounded-lg text-sm hover:bg-teal-50 hover:text-teal-700 transition-colors">Policies / السياسات</Link>
                    <Link href="/reviews" className="block px-3 py-2 rounded-lg text-sm hover:bg-teal-50 hover:text-teal-700 transition-colors">Reviews / التقييمات</Link>
                  </div>
                )}
              </div>
            </nav>

            <div className="hidden lg:flex items-center gap-2">
              <select value={router.locale ?? "ar"} onChange={(e) => changeLocale(e.target.value)}
                className="text-sm rounded-xl border border-white/25 bg-white/10 text-white/95 px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-white/50" aria-label="Change language">
                <option value="ar">العربية</option><option value="en">English</option><option value="fr">Français</option><option value="hi">हिन्दी</option><option value="fa">فارسی</option><option value="ur">اردو</option>
              </select>
              <select value={currency} onChange={(e) => changeCurrency(e.target.value as Currency)}
                className="text-sm rounded-xl border border-white/25 bg-white/10 text-white/95 px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-white/50" aria-label="Change currency">
                <option value="OMR">OMR</option><option value="AED">AED</option><option value="SAR">SAR</option><option value="USD">USD</option>
              </select>
              <button onClick={toggleTheme} className="p-2 rounded-xl border border-white/25 text-white/95 hover:shadow hover:shadow-black/10 hover:ring-2 hover:ring-white/30 transition-all" aria-label="Toggle theme" title="ليل/نهار">
                {theme === "light" ? <MoonIcon className="w-5 h-5" /> : <SunIcon className="w-5 h-5" />}
              </button>
              <Link href="/login" className="inline-flex items-center gap-1 px-3 py-2 rounded-xl font-semibold bg-white text-[var(--brand-700)] hover:bg-teal-50 transition-all">
                <UserIcon className="w-5 h-5" /> {tt("cta.login")}
              </Link>
            </div>

            <button onClick={() => setMobileOpen((s) => !s)} className="lg:hidden p-2 rounded-xl border border-white/25 text-white" aria-label="فتح القائمة">
              {mobileOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="lg:hidden border-t border-white/20 bg-white text-gray-800">
            <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-6 py-3 space-y-1">
              {links.map((l) => (
                <Link key={l.href} href={l.href} onClick={() => setMobileOpen(false)} className="block px-3 py-2 rounded-xl font-medium hover:bg-teal-50 hover:text-teal-700 transition-colors">
                  {l.label}
                </Link>
              ))}
              <details className="group">
                <summary className="px-3 py-2 rounded-xl cursor-pointer hover:bg-teal-50 hover:text-teal-700">{tt("nav.more")}</summary>
                <div className="ps-4 space-y-1 mt-1">
                  <Link href="/about" onClick={() => setMobileOpen(false)} className="block px-3 py-2 rounded-lg text-sm hover:bg-teal-50 hover:text-teal-700">About / من نحن</Link>
                  <Link href="/contact" onClick={() => setMobileOpen(false)} className="block px-3 py-2 rounded-lg text-sm hover:bg-teal-50 hover:text-teال-700">Contact / تواصل</Link>
                  <Link href="/pricing" onClick={() => setMobileOpen(false)} className="block px-3 py-2 rounded-lg text-sm hover:bg-teal-50 hover:text-teal-700">Pricing / الأسعار</Link>
                  <Link href="/policies" onClick={() => setMobileOpen(false)} className="block px-3 py-2 rounded-lg text-sm hover:bg-teal-50 hover:text-teal-700">Policies / السياسات</Link>
                  <Link href="/reviews" onClick={() => setMobileOpen(false)} className="block px-3 py-2 rounded-lg text-sm hover:bg-teal-50 hover:text-teal-700">Reviews / التقييمات</Link>
                </div>
              </details>

              <div className="flex items-center gap-2 pt-2">
                <select value={router.locale ?? "ar"} onChange={(e) => changeLocale(e.target.value)} className="flex-1 text-sm rounded-xl border border-gray-200 bg-white px-2 py-2">
                  <option value="ar">العربية</option><option value="en">English</option><option value="fr">Français</option><option value="hi">हिन्दी</option><option value="fa">فارسی</option><option value="ur">اردو</option>
                </select>
                <select value={currency} onChange={(e) => changeCurrency(e.target.value as Currency)} className="flex-1 text-sm rounded-xl border border-gray-200 bg-white px-2 py-2">
                  <option value="OMR">OMR</option><option value="AED">AED</option><option value="SAR">SAR</option><option value="USD">USD</option>
                </select>
                <button onClick={toggleTheme} className="p-2 rounded-xl border border-gray-200" aria-label="تبديل النمط">
                  {theme === "light" ? <MoonIcon className="w-5 h-5" /> : <SunIcon className="w-5 h-5" />}
                </button>
                <Link href="/login" onClick={() => setMobileOpen(false)} className="inline-flex items-center gap-1 px-3 py-2 rounded-xl font-semibold bg-[var(--brand-600)] text-white hover:bg-[var(--brand-700)] transition-colors">
                  <UserIcon className="w-5 h-5" /> {tt("cta.login")}
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>
    </div>
  );
}
