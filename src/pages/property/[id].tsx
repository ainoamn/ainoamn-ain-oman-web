// src/pages/property/[id].tsx
import { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import Layout from "@/components/layout/Layout";
// 👇 استيراد i18n من الملف المركزي
import { useI18n } from "@/lib/i18n";
import { useMemo } from "react";

type Property = {
  id: string; // AO-P-######
  title: string;
  description?: string;
  priceMonthly?: number;
  currency?: string;
  images?: string[];
  location?: string;
  createdAt?: string;
  updatedAt?: string;
  [k: string]: any;
};

type PageProps = { property: Property | null };

export default function PropertyDetailsPage({ property }: PageProps) {
  const _i18n = (useI18n() as any) || {};
  const t = (k: string, def: string) => {
    try { const v = _i18n?.t?.(k); return typeof v === "string" && v ? v : def; }
    catch { return def; }
  };
  const lang: string = _i18n?.lang || "ar";
  const dir: "rtl"|"ltr" = _i18n?.dir || (["ar","fa","ur"].includes(lang) ? "rtl" : "ltr");

  const monthly = property?.priceMonthly ?? 0;
  const yearly = monthly * 12;

  return (
    <Layout>
      <Head>
        <title>{property ? `${property.title} — ${t("property.details","تفاصيل العقار")}` : t("property.notFound","لم يتم العثور على العقار")}</title>
      </Head>

      <main dir={dir} lang={lang} className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto p-4 md:p-6">
          {/* Breadcrumbs */}
          <nav className="text-sm mb-4 flex items-center gap-3">
            <Link className="underline" href="/">{t("common.home","الرئيسية")}</Link>
            <span>/</span>
            <Link className="underline" href="/properties">{t("properties.title","العقارات")}</Link>
            <span>/</span>
            <span className="text-gray-500">{property?.id || "—"}</span>
            <div className="ms-auto">
              <Link href="/admin/tasks" className="underline">{t("tasks.title","لوحة المهام")}</Link>
            </div>
          </nav>

          {!property ? (
            <div className="rounded-xl p-8 bg-white shadow">
              <p>{t("property.notFound","لم يتم العثور على العقار")}</p>
              <div className="mt-4">
                <Link className="underline" href="/properties">{t("properties.title","العقارات")}</Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Gallery */}
              <section className="lg:col-span-2">
                <div className="bg-white rounded-2xl shadow overflow-hidden">
                  <div className="aspect-video bg-gray-200 flex items-center justify-center">
                    {property.images && property.images.length ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={property.images[0]}
                        alt={property.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-gray-500">No Image</div>
                    )}
                  </div>
                  {property.images && property.images.length > 1 && (
                    <div className="p-3 flex gap-2 overflow-x-auto">
                      {property.images.slice(1).map((src, i) => (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          key={i}
                          src={src}
                          alt={`thumb-${i}`}
                          className="h-16 w-24 object-cover rounded"
                        />
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-6 bg-white rounded-2xl shadow p-6">
                  <h1 className="text-2xl font-semibold mb-2">{property.title}</h1>
                  {property.location && (
                    <p className="text-sm text-gray-600 mb-3">
                      <span className="font-medium">{t("property.location","الموقع")}:</span>{" "}
                      {property.location}
                    </p>
                  )}
                  <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                    {property.description || ""}
                  </p>
                </div>
              </section>

              {/* Side panel */}
              <aside className="lg:col-span-1">
                <div className="bg-white rounded-2xl shadow p-6 sticky top-6">
                  <div className="space-y-3 mb-5">
                    <div className="text-sm text-gray-600">{t("property.monthlyPrice","السعر الشهري")}</div>
                    <div className="text-3xl font-bold" style={{ color: "var(--brand-800, #0f766e)" }}>
                      {monthly?.toLocaleString()} {property.currency || t("currency.OMR","ريال عُماني")}
                    </div>
                    <div className="text-sm text-gray-600">{t("property.yearlyPrice","السعر السنوي")}</div>
                    <div className="text-xl font-semibold" style={{ color: "var(--brand-700, #115e59)" }}>
                      {yearly?.toLocaleString()} {property.currency || t("currency.OMR","ريال عُماني")}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <ActionButton label={t("actions.chat","دردشة")} href={`/chat?property=${encodeURIComponent(property.id)}`} />
                    <ActionButton label={t("actions.manage","إدارة")} href={`/admin/properties/manage?id=${encodeURIComponent(property.id)}`} />
                    <ActionButton label={t("actions.preview","معاينة")} href={`/preview/property/${encodeURIComponent(property.id)}`} />
                    <ActionButton label={t("actions.price","سِعر")} href={`#price-${encodeURIComponent(property.id)}`} />
                    <ActionButton label={t("actions.book","حجز")} href={`/booking?property=${encodeURIComponent(property.id)}`} full />
                  </div>
                </div>
              </aside>
            </div>
          )}
        </div>
      </main>
    </Layout>
  );
}

function ActionButton({ label, href, full = false }: { label: string; href: string; full?: boolean }) {
  return (
    <Link
      href={href}
      className={`text-center px-4 py-2 rounded-xl border transition hover:shadow ${full ? "col-span-2" : ""}`}
      style={{
        background: "var(--brand-600, #14b8a6)",
        color: "white",
        borderColor: "var(--brand-700, #115e59)",
      }}
    >
      {label}
    </Link>
  );
}

export const getServerSideProps: GetServerSideProps<PageProps> = async (ctx) => {
  const id = String(ctx.params?.id || "");
  const fs = await import("fs");
  const path = await import("path");
  const FILE_PATH = path.join(process.cwd(), ".data", "properties.json");

  let property: Property | null = null;
  try {
    if (fs.existsSync(FILE_PATH)) {
      const raw = fs.readFileSync(FILE_PATH, "utf8");
      const list: Property[] = JSON.parse(raw || "[]");
      property = list.find((p) => p.id === id) || null;
    }
  } catch {
    property = null;
  }

  return { props: { property } };
};
