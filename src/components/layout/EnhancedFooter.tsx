// src/components/layout/EnhancedFooter.tsx
import Link from "next/link";
import { useCustomization } from "@/contexts/CustomizationContext";

export default function EnhancedFooter() {
  const { header, footer } = useCustomization();
  // يرث اللون من الهيدر مع شفافية الفوتر
  const bg = header.backgroundColor;
  const alpha = Math.round((footer.transparency / 100) * 255)
    .toString(16)
    .padStart(2, "0");
  const bgWithAlpha = `${bg}${alpha}`;

  return (
    <footer className="border-t border-neutral-200 dark:border-neutral-800 text-white" style={{ backgroundColor: bgWithAlpha, color: footer.textColor }}>
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="font-semibold text-lg">عين عُمان</div>
            <p className="text-sm mt-2 leading-6 opacity-90">منصّة عقارية لإدارة العقارات والمزادات والمشاريع.</p>
          </div>

          {footer.sections.map((section, i) => (
            <div key={i}>
              <div className="font-semibold">{section.title}</div>
              <ul className="mt-3 space-y-2 text-sm">
                {section.links.map((l, j) => (
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
                البريد: <a className="hover:underline" href={`mailto:${footer.contactInfo.email}`}>{footer.contactInfo.email}</a>
              </li>
              <li>
                الهاتف: <a className="hover:underline" href={`tel:${footer.contactInfo.phone}`}>{footer.contactInfo.phone}</a>
              </li>
              <li>العنوان: {footer.contactInfo.address}</li>
            </ul>

            <div className="mt-6">
              <div className="text-sm font-semibold mb-2">طرق الدفع / الشركاء</div>
              <div className="flex flex-wrap items-center gap-3">
                {footer.paymentMethods.map((p, i) => (
                  <span key={i} className="inline-flex items-center gap-2 bg-white/10 px-2 py-1 rounded">
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
            <Link href="/terms" className="hover:underline">الشروط</Link>
            <Link href="/privacy" className="hover:underline">الخصوصية</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
