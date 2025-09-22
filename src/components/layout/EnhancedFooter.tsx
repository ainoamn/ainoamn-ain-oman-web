// src/components/layout/EnhancedFooter.tsx
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useCustomization } from "@/contexts/CustomizationContext";
import { useLayoutScope } from "@/contexts/LayoutScope";

type Props = { force?: boolean };
function EnhancedFooter({ force = false }: Props) {
  // حارس منع التكرار
  const scope = useLayoutScope();
  if (scope?.global && !force) return null;

  const { footer, header } = useCustomization();

  const [brand, setBrand] = useState<string>(header?.backgroundColor || "#0d9488");
  const rootObs = useRef<MutationObserver | null>(null);

  useEffect(() => {
    try {
      const first = header?.backgroundColor || readCssBrand() || "#0d9488";
      setBrand(first);
    } catch (_e) {}
  }, [header?.backgroundColor]);

  useEffect(() => {
    const onBrand = (e: any) => {
      const c = e?.detail?.color as string | undefined;
      if (c) setBrand(c);
    };
    window.addEventListener("brand:changed", onBrand as any);

    rootObs.current = new MutationObserver(() => {
      const cssColor = readCssBrand();
      if (cssColor) setBrand((b) => (b !== cssColor ? cssColor : b));
    });
    rootObs.current.observe(document.documentElement, { attributes: true, attributeFilter: ["style"] });

    return () => {
      window.removeEventListener("brand:changed", onBrand as any);
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
                البريد: <a href={`mailto:${footer.contactInfo.email}`} className="hover:underline">{footer.contactInfo.email}</a>
              </li>
              <li>
                الهاتف: <a href={`tel:${footer.contactInfo.phone}`} className="hover:underline">{footer.contactInfo.phone}</a>
              </li>
              <li>العنوان: {footer.contactInfo.address}</li>
            </ul>

            {footer.paymentMethods?.length > 0 && (
              <div className="mt-6">
                <div className="text-sm font-semibold mb-2">طرق الدفع</div>
                <div className="flex flex-wrap items-center gap-3">
                  {footer.paymentMethods.map((p, i) => (
                    <span key={i} className="inline-flex items-center gap-2 bg-black/10 px-2 py-1 rounded">
                      {p.icon ? <img src={p.icon} alt={p.name} className="h-5 w-auto" /> : null}
                      <span className="text-xs">{p.name}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
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
