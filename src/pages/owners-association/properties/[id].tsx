import React, { useState } from "react";
import Head from "next/head"; import Link from "next/link"; import { useRouter } from "next/router";
import Layout from "@/components/layout/Layout"; import { useTSafe } from "@/lib/i18n-safe"; import HoaNav from "@/components/hoa/HoaNav";
type Unit = { id: string; name: string; owner?: string; area?: number; balance?: number };

export default function HoaPropertyDetail() {
  const { t, dir } = useTSafe(); const r = useRouter(); const { id } = r.query as { id?: string };
  const [units] = useState<Unit[]>([
    { id: "U-101", name: "الدور 1 - شقة 1", owner: "م. أحمد", area: 120, balance: 0 },
    { id: "U-102", name: "الدور 1 - شقة 2", owner: "م. سمية", area: 115, balance: 72.5 },
  ]);
  return (
    <Layout>
      <Head><title>{t("hoa.prop.title","تفاصيل العقار")}</title></Head>
      <div dir={dir} className="space-y-6">
        <HoaNav />
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">{t("hoa.prop.title","تفاصيل العقار")}</h1>
          <Link href="/owners-association/tracking" className="px-3 py-2 rounded-xl bg-[var(--brand-700,#0f766e)] text-white">{t("hoa.prop.toTracking","المتابعة")}</Link>
        </header>
        <section className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4">
          <h2 className="font-medium mb-2">{t("hoa.prop.meta","بيانات أساسية")}</h2>
          <div className="grid md:grid-cols-3 gap-2 text-sm">
            <div><span className="text-neutral-500">{t("id","المعرف")}:</span> <span>{id || "—"}</span></div>
            <div><span className="text-neutral-500">{t("address","العنوان")}:</span> <span>—</span></div>
            <div><span className="text-neutral-500">{t("hoa","الجمعية")}:</span> <span>—</span></div>
          </div>
        </section>
        <section className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300"><tr><th className="text-start p-3">#</th><th className="text-start p-3">{t("unit","الوحدة")}</th><th className="text-start p-3">{t("owner","المالك")}</th><th className="text-start p-3">{t("area","المساحة")}</th><th className="text-start p-3">{t("balance","الرصيد")}</th></tr></thead>
            <tbody>{units.map((u,i)=>(<tr key={u.id} className="border-t border-neutral-200 dark:border-neutral-800"><td className="p-3">{i+1}</td><td className="p-3">{u.name}</td><td className="p-3">{u.owner || "—"}</td><td className="p-3">{u.area ?? "—"}</td><td className="p-3">{u.balance ?? "—"}</td></tr>))}</tbody>
          </table>
        </section>
      </div>
    </Layout>
  );
}
