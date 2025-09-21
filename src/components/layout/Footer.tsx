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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="font-semibold text-lg">عين عُمان</div>
            <p className="text-sm mt-2 leading-6 opacity-90">منصّة عقارية لإدارة العقارات والمزادات.</p>
          </div>

          {footer.sections.map((s, i) => (
            <div key={i}>
              <div className="font-semibold">{s.title}</div>
              <ul className="mt-3 space-y-2 text-sm">
                {s.links.map((l, j) => (
                  <li key={j}>
                    <Link href={l.href} className="hover:underline opacity-90 hover:opacity-100">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <div className="font-semibold">تواصل</div>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                البريد: <a href={`mailto:${footer.contact.email}`} className="hover:underline">{footer.contact.email}</a>
              </li>
              <li>
                الهاتف: <a href={`tel:${footer.contact.phone}`} className="hover:underline">{footer.contact.phone}</a>
              </li>
              <li>العنوان: {footer.contact.address}</li>
            </ul>

            <div className="mt-6">
              <div className="text-sm font-semibold mb-2">طرق الدفع</div>
              <div className="flex flex-wrap items-center gap-3">
                {footer.payments.map((p, i) => (
                  <span key={i} className="inline-flex items-center gap-2 bg-black/10 px-2 py-1 rounded">
                    {p.icon ? <img src={p.icon} alt={p.name} className="h-5 w-auto" /> : null}
                    <span className="text-xs">{p.name}</span>
                  </span>
                ))}
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
