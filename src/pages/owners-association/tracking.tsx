import React, { useState } from "react";
import Head from "next/head"; import InstantLink from '@/components/InstantLink';
import Layout from "@/components/layout/Layout"; import { useTSafe } from "@/lib/i18n-safe";
import HoaNav from "@/components/hoa/HoaNav"; import StatusBadge from "@/components/common/StatusBadge";
type Row = { id: string; title: string; status: "open"|"in_progress"|"done"; due?: string };

export default function TrackingPage() {
  const { t, dir } = useTSafe();
  const [rows] = useState<Row[]>([
    { id: "AO-T-000101", title: "صيانة المصعد - البرج A", status: "in_progress", due: "2025-09-05" },
    { id: "AO-T-000099", title: "تجديد عقد الحراسة", status: "open", due: "2025-09-12" },
  ]);
  return (
    <Layout>
      <Head><title>{t("hoa.tracking.title","المتابعة")}</title></Head>
      <div dir={dir} className="space-y-6">
        <HoaNav />
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">{t("hoa.tracking.title","المتابعة")}</h1>
          <InstantLink href="/admin/tasks" className="px-3 py-2 rounded-xl bg-[var(--brand-700,#0f766e)] text-white">{t("hoa.tracking.openBoard","فتح لوحة المهام")}</InstantLink>
        </header>
        <section className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
              <tr><th className="text-start p-3">#</th><th className="text-start p-3">{t("title","العنوان")}</th><th className="text-start p-3">{t("status","الحالة")}</th><th className="text-start p-3">{t("due","الاستحقاق")}</th></tr>
            </thead>
            <tbody>{rows.map((r, i) => (<tr key={r.id} className="border-t border-neutral-200 dark:border-neutral-800">
              <td className="p-3">{i + 1}</td><td className="p-3">{r.title}</td><td className="p-3"><StatusBadge status={r.status} /></td><td className="p-3">{r.due || "—"}</td></tr>))}</tbody>
          </table>
        </section>
      </div>
    </Layout>
  );
}
