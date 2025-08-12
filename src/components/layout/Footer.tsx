// src/components/layout/Footer.tsx
import Link from "next/link";
import { useRouter } from "next/router";
import { getT } from "../../lib/i18n";

export default function Footer() {
  const router = useRouter();
  const tt = getT(router);

  return (
    <footer className="mt-12 text-white">
      <div className="brand-bg">
        <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-6 py-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl">{tt("brand.name")}</span>
            </div>
            <p className="mt-3 text-sm text-white/90">
              {tt("footer.tagline")}
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-3">{tt("nav.home")}</h3>
            <ul className="space-y-2">
              <li><Link className="hover:underline underline-offset-4" href="/">{tt("nav.home")}</Link></li>
              <li><Link className="hover:underline underline-offset-4" href="/properties">{tt("nav.properties")}</Link></li>
              <li><Link className="hover:underline underline-offset-4" href="/auctions">{tt("nav.auctions")}</Link></li>
              <li><Link className="hover:underline underline-offset-4" href="/companies">{tt("nav.companies")}</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-3">{tt("nav.more")}</h3>
            <ul className="space-y-2">
              <li><Link className="hover:underline underline-offset-4" href="/about">About / من نحن</Link></li>
              <li><Link className="hover:underline underline-offset-4" href="/contact">Contact / تواصل</Link></li>
              <li><Link className="hover:underline underline-offset-4" href="/pricing">Pricing / الأسعار</Link></li>
              <li><Link className="hover:underline underline-offset-4" href="/policies">Policies / السياسات</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Contact / تواصل</h3>
            <ul className="space-y-2 text-white/90">
              <li>📍 مسقط، سلطنة عمان</li>
              <li>📧 info@ainoman.com</li>
              <li>📞 +968 9000 0000</li>
            </ul>
            <p className="mt-3 text-xs text-white/80">
              {tt("brand.name")} — {tt("footer.tagline")}
            </p>
          </div>
        </div>
      </div>

      <div className="text-center text-sm py-3" style={{ backgroundColor: "var(--brand-700)" }}>
        © {new Date().getFullYear()} {tt("brand.name")} — جميع الحقوق محفوظة.
      </div>
    </footer>
  );
}
