
// src/pages/properties/[id].tsx
import Head from "next/head";
import Layout from "@/components/layout/Layout";
import { useI18n } from "@/lib/i18n";
import type { GetServerSideProps } from "next";

type Property = any;

export default function PropertyDetailsPage({ property, id }: { property: Property | null; id: string; }) {
  const { t, dir } = useI18n();

  if (!property) {
    return (
      <Layout>
        <Head><title>{t("common.not_found","غير موجود")} | Ain Oman</title></Head>
        <main dir={dir} className="min-h-screen bg-slate-50">
          <div className="mx-auto max-w-4xl px-4 py-12">
            <h1 className="text-2xl font-bold mb-2">{t("common.not_found","غير موجود")}</h1>
            <p className="text-slate-600">{t("common.not_found.desc","لم نعثر على هذا العقار.")}</p>
          </div>
        </main>
      </Layout>
    );
  }

  return (
    <Layout>
      <Head><title>{property?.title || "Property"} | Ain Oman</title></Head>
      <main dir={dir} className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-8">
          <h1 className="text-2xl font-bold mb-2">{property?.title || id}</h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 rounded-2xl bg-white p-4 shadow-sm">
              <div className="aspect-video bg-slate-100 rounded-xl mb-4" />
              <p className="text-slate-700 whitespace-pre-line">{property?.description || ""}</p>
            </div>
            <aside className="rounded-2xl bg-white p-4 shadow-sm">
              <div className="text-sm text-slate-600">{t("card.price_from","ابتداءً من")}</div>
              <div className="text-2xl font-bold">{property?.price ? property.price.toLocaleString() : "-"}</div>
            </aside>
          </div>
        </div>
      </main>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const id = String(ctx.params?.id || "");

  // Import server-only module here so it won't be bundled on the client
  const { readJson } = await import("@/server/fsdb");

  // Try reading from /data/properties.json; fall back to empty list
  let property: Property | null = null;
  try {
    const list = await readJson<Property[]>("properties", []);
    property = list.find((p: any) => String(p?.id) === id) || null;
  } catch (_) {
    property = null;
  }

  return { props: { property, id } };
};
