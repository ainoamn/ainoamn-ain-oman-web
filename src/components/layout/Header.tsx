"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type MenuItem = { label: string; href: string };
type HeaderConfig = {
  backgroundColor: string; textColor: string; logo: string;
  menuItems: MenuItem[]; showUserColorPicker: boolean; availableColors: string[];
};
const K = { header: "hf.header.v1", userColor: "hf.userColor.v1" };

/* إضافات جلسة بدون تغيير البنية */
type SessionUser = { id?: string; name?: string; role?: string; features?: string[] } | null;
const AUTH_KEY = "ain_auth";
const AUTH_EVENT = "ain_auth:change";

export default function Header() {
  const [brand, setBrand] = useState("#0d9488");
  const [cfg, setCfg] = useState<HeaderConfig>({
    backgroundColor:"#0d9488", textColor:"#ffffff", logo:"/logo.png",
    menuItems:[
      { label:"الرئيسية", href:"/" },
      { label:"العقارات", href:"/properties" },
      { label:"المزادات", href:"/auctions" },
      { label:"المطورون", href:"/development/projects" },
      { label:"الاشتراكات", href:"/subscriptions" },
      { label:"التقييمات", href:"/reviews" },
      { label:"تواصل معنا", href:"/contact" },
    ],
    showUserColorPicker:true,
    availableColors:["#0d9488","#2563eb","#7c3aed","#dc2626","#0f766e"],
  });

  const [hiddenOnScroll, setHiddenOnScroll] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const lastY = useRef(0);
  const paletteRef = useRef<HTMLDivElement|null>(null);
  const moreRef = useRef<HTMLDivElement|null>(null);

  /* حالة المستخدم — إضافة فقط */
  const [user, setUser] = useState<SessionUser>(null);
  function readSession(): SessionUser {
    try { const raw = localStorage.getItem(AUTH_KEY); return raw ? JSON.parse(raw) : null; } catch { return null; }
  }
  function doLogout() {
    try { localStorage.removeItem(AUTH_KEY); localStorage.removeItem("auth_token"); } catch {}
    try { window.dispatchEvent(new CustomEvent(AUTH_EVENT)); } catch {}
    setUser(null);
  }

  useEffect(() => {
    try { const h = localStorage.getItem(K.header); if (h) setCfg((o)=>({ ...o, ...JSON.parse(h) })); } catch {}
    (async () => { try { const r = await fetch("/api/header-footer"); if (r.ok) {
      const j = await r.json(); if (j?.header) setCfg((o)=>({ ...o, ...j.header }));
    } } catch {} })();
  }, []);

  useEffect(() => {
    const userColor = typeof window!=="undefined" ? localStorage.getItem(K.userColor) : null;
    const color = userColor || cfg.backgroundColor || "#0d9488";
    setBrand(color);
    applyTheme(color);
  }, [cfg.backgroundColor]);

  useEffect(() => {
    const onScroll = () => { const y = window.scrollY; setHiddenOnScroll(y>lastY.current && y>20); lastY.current = y; };
    window.addEventListener("scroll", onScroll, { passive:true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    /* تهيئة الجلسة والمتابعة لأي تغيّر */
    setUser(readSession());
    const onStorage = (e: StorageEvent) => { if (e.key === AUTH_KEY) setUser(readSession()); };
    const onCustom = () => setUser(readSession());
    window.addEventListener("storage", onStorage);
    window.addEventListener(AUTH_EVENT, onCustom as any);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(AUTH_EVENT, onCustom as any);
    };
  }, []);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      const t = e.target as Node;
      if (paletteOpen && paletteRef.current && !paletteRef.current.contains(t)) setPaletteOpen(false);
      if (moreOpen && moreRef.current && !moreRef.current.contains(t)) setMoreOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [paletteOpen, moreOpen]);

  const chooseColor = (hex: string) => {
    try { localStorage.setItem(K.userColor, hex); } catch {}
    setBrand(hex);
    applyTheme(hex);
    setPaletteOpen(false);
  };

  const topLinks = cfg.menuItems.slice(0, 4);
  const moreLinks = cfg.menuItems.slice(4);

  return (
    <div className={`brand-scope sticky top-0 z-50 transition-transform duration-300 ${hiddenOnScroll ? "-translate-y-full" : "translate-y-0"}`}>
      <header className="border-b" style={{ backgroundColor: brand, color: cfg.textColor, borderColor: "rgba(255,255,255,0.2)" }}>
        <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-6">
          <div className="flex items-center justify-between py-3">
            <Link href="/" className="flex items-center gap-2">
              <img src={cfg.logo} alt="logo" className="w-9 h-9 object-contain" />
              <span className="text-2xl font-black tracking-tight opacity-90">عين عُمان</span>
            </Link>

            <nav className="hidden lg:flex items-center gap-1">
              {topLinks.map((item) => (
                <Link key={item.href} href={item.href}
                  className="px-3 py-2 rounded-xl font-medium transition-all hover:shadow hover:ring-2 hover:ring-white/30"
                  style={{ color: cfg.textColor, opacity: 0.9 }}>
                  {item.label}
                </Link>
              ))}

              {moreLinks.length>0 && (
                <div className="relative" ref={moreRef}>
                  <button className="px-3 py-2 rounded-xl font-medium hover:ring-2 hover:ring-white/30"
                          style={{ color: cfg.textColor, opacity: 0.9 }}
                          onClick={()=>setMoreOpen(s=>!s)} aria-haspopup="menu" aria-expanded={moreOpen} title="المزيد">
                    المزيد ▾
                  </button>
                  {moreOpen && (
                    <div className="absolute end-0 mt-2 min-w-56 rounded-xl border border-white/15 bg-white text-gray-800 shadow-lg p-2" role="menu">
                      {moreLinks.map((c) => (
                        <Link key={c.href} href={c.href}
                          className="block px-3 py-2 rounded-lg text-sm hover:bg-teal-50 hover:text-teal-700 transition-colors"
                          onClick={()=>setMoreOpen(false)}>{c.label}</Link>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </nav>

            <div className="hidden lg:flex items-center gap-3">
              {cfg.showUserColorPicker && (
                <div className="relative" ref={paletteRef}>
                  <button onClick={()=>setPaletteOpen(s=>!s)}
                          className="p-2 rounded-xl border border-white/25 text-white hover:ring-2 hover:ring-white/30"
                          aria-haspopup="true" aria-expanded={paletteOpen} aria-label="اختيار اللون" title="اختيار اللون">
                    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor" aria-hidden="true">
                      <path d="M7 14c-1.657 0-3 1.343-3 3 0 1.105-.895 2-2 2h8c0-2.761-2.239-5-5-5Zm13.707-9.293a1 1 0 0 0-1.414 0l-7.5 7.5a1 1 0  0 0-.263.456l-1 3a1 1 0 0 0 1.262 1.262l3-1a1 1 0 0 0 .456-.263l7.5-7.5a1 1 0 0 0 0-1.414l-2.041-2.041Z"/>
                    </svg>
                  </button>
                  {paletteOpen && (
                    <div className="absolute end-0 mt-2 rounded-xl border border-white/15 bg-white text-gray-800 shadow-lg p-3">
                      <div className="flex items-center gap-2">
                        {cfg.availableColors.slice(0,5).map((c)=>(
                          <button key={c} onClick={()=>chooseColor(c)}
                            className="h-7 w-7 rounded-full border border-black/10 focus:outline-none focus:ring-2 focus:ring-black/20"
                            style={{ backgroundColor:c }} title={c} aria-label={`لون ${c}`} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* قسم حالة المستخدم — إضافة فقط */}
              {user ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm opacity-90">{user.name}</span>
                  <Link href="/dashboard" className="btn btn-primary" title="لوحتي">لوحتي</Link>
                  <button onClick={doLogout}
                          className="px-3 py-1.5 rounded-xl border border-white/25 text-white hover:ring-2 hover:ring-white/30"
                          title="تسجيل الخروج">
                    خروج
                  </button>
                </div>
              ) : (
                <Link href="/login" className="btn btn-primary" title="الدخول">الدخول</Link>
              )}
            </div>

            <div className="lg:hidden" />
          </div>
        </div>
      </header>
    </div>
  );
}

/* يحدّث المتغيّرات فقط. لا يحقن CSS جديد ولا يغيّر البنية */
function applyTheme(hex: string) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.style.setProperty("--brand-600", hex);
  root.style.setProperty("--brand-700", shade(hex, -8));
  root.style.setProperty("--brand-800", shade(hex, -16));

  const btnText = readableTextOn(hex);
  root.style.setProperty("--btn-text", btnText);

  try { window.dispatchEvent(new CustomEvent("brand:changed", { detail: { color: hex } })); } catch {}
}
function shade(hex: string, percent: number) {
  const clean = hex.replace("#", "");
  const p = Math.max(-100, Math.min(100, percent)) / 100;
  const n = parseInt(clean, 16);
  const r = n >> 16, g = (n >> 8) & 0xff, b = n & 0xff;
  const rr = clamp(Math.round(r + (p < 0 ? r : 255 - r) * p));
  const gg = clamp(Math.round(g + (p < 0 ? g : 255 - g) * p));
  const bb = clamp(Math.round(b + (p < 0 ? b : 255 - b) * p));
  return "#" + ((1 << 24) + (rr << 16) + (gg << 8) + bb).toString(16).slice(1);
}
function clamp(v:number){ return Math.min(255, Math.max(0, v)); }
function readableTextOn(bgHex: string) {
  const c = bgHex.replace("#", "");
  const n = parseInt(c.length === 3 ? c.split("").map(x=>x+x).join("") : c, 16);
  const r = (n>>16)&255, g=(n>>8)&255, b=n&255;
  const yiq = (r*299 + g*587 + b*114)/1000;
  return yiq >= 140 ? "#111827" : "#ffffff";
}
