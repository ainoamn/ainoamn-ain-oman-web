// src/components/layout/Footer.tsx
"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useLayoutScope } from "@/contexts/LayoutScope"; // حارس منع التكرار

type SectionLink = { label: string; href: string };
type FooterSection = { title: string; links: SectionLink[] };
type FooterSettings = {
  textColor: string;
  transparency: number;
  sections: FooterSection[];
  contact: { email: string; phone: string; address: string };
  payments: { name: string; icon?: string }[];
};

const K = { footer: "hf.footer.v1", header: "hf.header.v1", userColor: "hf.userColor.v1" };

export default function Footer() {
  // إذا الصفحة داخل تخطيط عالمي، ألغِ العرض لتجنّب التكرار
  const scope = useLayoutScope();
  if (scope?.global) return null;

  const [footer, setFooter] = useState<FooterSettings>({
    textColor: "#ffffff",
    transparency: 70,
    sections: [],
    contact: { email: "", phone: "", address: "" },
    payments: [],
  });
  const [brand, setBrand] = useState<string>("#0d9488");
  const rootObs = useRef<MutationObserver | null>(null);

  useEffect(() => {
    try {
      const f = localStorage.getItem(K.footer);
      if (f) setFooter((o) => ({ ...o, ...JSON.parse(f) }));
    } catch {}
    (async () => {
      try {
        const r = await fetch("/api/header-footer");
        if (r.ok) {
          const j = await r.json();
          if (j?.footer) setFooter((o) => ({ ...o, ...j.footer }));
          if (j?.header?.backgroundColor) {
            const u = readUserColor();
            setBrand(u || j.header.backgroundColor);
          }
        }
      } catch {}
    })();
    const first = readUserColor() || readCssBrand() || "#0d9488";
    setBrand(first);
  }, []);

  useEffect(() => {
    const onBrand = (e: any) => {
      const c = e?.detail?.color as string | undefined;
      if (c) setBrand(c);
    };
    window.addEventListener("brand:changed", onBrand as any);

    const onStorage = (e: StorageEvent) => {
      if (e.key === K.userColor) {
        const color = readUserColor();
        if (color) setBrand(color);
      }
    };
    window.addEventListener("storage", onStorage);

    rootObs.current = new MutationObserver(() => {
      const cssColor = readCssBrand();
      if (cssColor) setBrand((b) => (b !== cssColor ? cssColor : b));
    });
    rootObs.current.observe(document.documentElement, { attributes: true, attributeFilter: ["style"] });

    return () => {
      window.removeEventListener("brand:changed", onBrand as any);
      window.removeEventListener("storage", onStorage);
      rootObs.current?.disconnect();
    };
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty("--footer-opacity", String(alpha(footer.transparency)));
  }, [footer.transparency]);

  const footerBg = useMemo(() => {
    const a = alpha(footer.transparency);
    const p = Math.round(a * 100);
    return `color-mix(in oklab, ${brand} ${p}%, transparent ${100 - p}%)`;
  }, [brand, footer.transparency]);

  return (
    <footer className="border-t border-neutral-200 dark:border-neutral-800" style={{ background: footerBg, color: footer.textColor }}>
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* معلومات الشركة */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <img src="/logo.png" alt="logo" className="w-8 h-8 object-contain" />
              <div className="font-semibold text-lg">عين عُمان</div>
            </div>
            <p className="text-sm mt-2 leading-6 opacity-90 mb-4">
              منصّة عقارية شاملة لإدارة العقارات والمزادات والاستثمار العقاري في سلطنة عُمان.
            </p>
            
            {/* وسائل التواصل الاجتماعي */}
            <div className="flex items-center gap-3">
              <a href="#" className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
                📘
              </a>
              <a href="#" className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
                📷
              </a>
              <a href="#" className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
                🐦
              </a>
              <a href="#" className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
                💼
              </a>
            </div>
          </div>

          {/* العقارات */}
          <div>
            <div className="font-semibold mb-3">العقارات</div>
            <ul className="space-y-2 text-sm">
              <li><Link href="/properties" className="hover:underline opacity-90 hover:opacity-100">جميع العقارات</Link></li>
              <li><Link href="/properties?type=apartment" className="hover:underline opacity-90 hover:opacity-100">شقق</Link></li>
              <li><Link href="/properties?type=villa" className="hover:underline opacity-90 hover:opacity-100">فيلات</Link></li>
              <li><Link href="/properties?type=office" className="hover:underline opacity-90 hover:opacity-100">مكاتب</Link></li>
              <li><Link href="/properties?type=shop" className="hover:underline opacity-90 hover:opacity-100">محلات</Link></li>
              <li><Link href="/properties/map" className="hover:underline opacity-90 hover:opacity-100">الخريطة</Link></li>
            </ul>
          </div>

          {/* الخدمات */}
          <div>
            <div className="font-semibold mb-3">الخدمات</div>
            <ul className="space-y-2 text-sm">
              <li><Link href="/auctions" className="hover:underline opacity-90 hover:opacity-100">المزادات</Link></li>
              <li><Link href="/development/projects" className="hover:underline opacity-90 hover:opacity-100">المشاريع</Link></li>
              <li><Link href="/subscriptions" className="hover:underline opacity-90 hover:opacity-100">الاشتراكات</Link></li>
              <li><Link href="/reviews" className="hover:underline opacity-90 hover:opacity-100">التقييمات</Link></li>
              <li><Link href="/reports" className="hover:underline opacity-90 hover:opacity-100">التقارير</Link></li>
              <li><Link href="/support" className="hover:underline opacity-90 hover:opacity-100">الدعم الفني</Link></li>
            </ul>
          </div>

          {/* تواصل معنا */}
          <div>
            <div className="font-semibold mb-3">تواصل معنا</div>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <span>📧</span>
                <a href={`mailto:${footer.contact.email || 'info@ainoman.com'}`} className="hover:underline">
                  {footer.contact.email || 'info@ainoman.com'}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <span>📞</span>
                <a href={`tel:${footer.contact.phone || '+968 1234 5678'}`} className="hover:underline">
                  {footer.contact.phone || '+968 1234 5678'}
                </a>
              </li>
              <li className="flex items-start gap-2">
                <span>📍</span>
                <span>{footer.contact.address || 'مسقط، سلطنة عُمان'}</span>
              </li>
            </ul>

            {/* طرق الدفع */}
            <div className="mt-6">
              <div className="text-sm font-semibold mb-3">طرق الدفع المقبولة</div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 bg-white/10 px-2 py-1 rounded text-xs">
                  💳 فيزا
                </span>
                <span className="inline-flex items-center gap-1 bg-white/10 px-2 py-1 rounded text-xs">
                  💳 ماستركارد
                </span>
                <span className="inline-flex items-center gap-1 bg-white/10 px-2 py-1 rounded text-xs">
                  🏦 بنك مسقط
                </span>
                <span className="inline-flex items-center gap-1 bg-white/10 px-2 py-1 rounded text-xs">
                  📱 محفظة إلكترونية
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-white/20 text-xs opacity-80 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div>© {new Date().getFullYear()} عين عُمان — جميع الحقوق محفوظة.</div>
          <div className="flex gap-4">
            <Link href="/terms" className="hover:underline">
              الشروط
            </Link>
            <Link href="/privacy" className="hover:underline">
              الخصوصية
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* helpers */
function alpha(transparency: number) {
  return Math.max(0.2, Math.min(1, transparency / 100));
}
function readUserColor(): string | null {
  try {
    return localStorage.getItem(K.userColor);
  } catch {
    return null;
  }
}
function readCssBrand(): string | null {
  try {
    const cs = getComputedStyle(document.documentElement);
    let c = cs.getPropertyValue("--brand-600")?.trim();
    if (!c) return null;
    if (c.startsWith("rgb")) {
      const m = c.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/i);
      if (!m) return null;
      const [_, r, g, b] = m;
      c = "#" + [r, g, b].map((x) => Number(x).toString(16).padStart(2, "0")).join("");
    }
    return c;
  } catch {
    return null;
  }
}
