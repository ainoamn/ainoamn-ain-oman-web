import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import Layout from "@/components/layout/Layout";
import { useI18n } from "@/lib/i18n";
import { useEffect, useState } from "react";

type HOASummary = {
  id: string;
  name: string;
  members: number;
  openTickets: number;
  collectionRate: number; // 0..1
};

export default function HOAOverview() {
  const { t, dir } = useI18n();
  const router = useRouter();
  const { hoaId } = router.query as { hoaId: string };
  const [data, setData] = useState<HOASummary | null>(null);

  useEffect(() => {
    if (!hoaId) return;
    fetch(`/api/hoa/${hoaId}`).then(r=>r.json()).then(setData);
  }, [hoaId]);

  return (
    <Layout>
      <Head><title>{t("owners.overview", "نظرة عامة")} | Ain Oman</title></Head>
      <main dir={dir} className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">{data?.name || t("owners.loading", "جاري التحميل...")}</h1>
            <div className="flex gap-2">
              <Link href={`/owners-association/${hoaId}/members`} className="rounded-xl border px-3 py-2">{t("owners.members", "الأعضاء")}</Link>
              <Link href={`/owners-association/${hoaId}/meetings`} className="rounded-xl border px-3 py-2">{t("owners.meetings", "الاجتماعات")}</Link>
              <Link href={`/owners-association/${hoaId}/votes`} className="rounded-xl border px-3 py-2">{t("owners.votes", "التصويت")}</Link>
              <Link href={`/owners-association/${hoaId}/finances`} className="rounded-xl border px-3 py-2">{t("owners.finances", "المالية")}</Link>
              <Link href={`/owners-association/${hoaId}/documents`} className="rounded-xl border px-3 py-2">{t("owners.documents", "المستندات")}</Link>
              <Link href={`/owners-association/${hoaId}/tickets`} className="rounded-xl border px-3 py-2">{t("owners.tickets", "الشكاوى/المخالفات")}</Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="rounded-2xl bg-white p-4 shadow-sm"><div className="text-sm text-slate-600">{t("owners.kpi.members","عدد الأعضاء")}</div><div className="text-2xl font-bold">{data?.members ?? "-"}</div></div>
            <div className="rounded-2xl bg-white p-4 shadow-sm"><div className="text-sm text-slate-600">{t("owners.kpi.tickets","قضايا مفتوحة")}</div><div className="text-2xl font-bold">{data?.openTickets ?? "-"}</div></div>
            <div className="rounded-2xl bg-white p-4 shadow-sm"><div className="text-sm text-slate-600">{t("owners.kpi.collection","نسبة التحصيل")}</div><div className="text-2xl font-bold">{data ? Math.round((data.collectionRate||0)*100) + "%" : "-"}</div></div>
            <div className="rounded-2xl bg-white p-4 shadow-sm"><div className="text-sm text-slate-600">{t("owners.kpi.health","المؤشر العام")}</div><div className="text-2xl font-bold">{data ? (Math.round((data.collectionRate||0)*100) > 80 ? "✅" : "⚠️") : "-"}</div></div>
          </div>
        </div>
      </main>
    </Layout>
  );
}
