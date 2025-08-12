import Head from "next/head";
import Layout from "@/components/layout/Layout";
import { useI18n } from "@/lib/i18n";

export default function Portfolio() {
  const { t, dir } = useI18n();
  return (
    <Layout>
      <Head><title>{t("invest.portfolio","محفظتي")} | Ain Oman</title></Head>
      <main dir={dir} className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-8">
          <h1 className="text-2xl font-bold mb-6">{t("invest.portfolio","محفظتي")}</h1>
          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <p className="text-slate-600">{t("invest.portfolio.desc","عرض المراكز والتوزيعات سيظهر هنا.")}</p>
          </div>
        </div>
      </main>
    </Layout>
  );
}
