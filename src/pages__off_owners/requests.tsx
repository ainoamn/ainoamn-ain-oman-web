import React, { useEffect, useState } from "react";
import Head from "next/head"; import Layout from "@/components/layout/Layout";
import { useTSafe } from "@/lib/i18n-safe"; import HoaNav from "@/components/hoa/HoaNav";
import StatusBadge from "@/components/common/StatusBadge";
type Ticket = { id: string; by: string; type: string; status: "open"|"in_progress"|"done"; createdAt: string };

export default function RequestsPage() {
  const { t, dir } = useTSafe();
  const [items, setItems] = useState<Ticket[]>([]); const [newT, setNewT] = useState({ by: "", type: "" });
  useEffect(() => { (async () => { try { const r = await fetch("/api/hoa/requests"); const js = await r.json(); setItems(js.items || []);} catch {} })(); }, []);
  const add = () => { if (!newT.by || !newT.type) return; const id = "REQ-" + Math.random().toString(36).slice(2, 6).toUpperCase(); setItems(prev => [{ id, by: newT.by, type: newT.type, status: "open", createdAt: new Date().toISOString().slice(0,10) }, ...prev]); setNewT({ by: "", type: "" }); };
  return (
    <Layout>
      <Head><title>{t("hoa.requests.title","الطلبات")}</title></Head>
      <div dir={dir} className="space-y-6">
        <HoaNav />
        <h1 className="text-2xl font-semibold">{t("hoa.requests.title","الطلبات")}</h1>
        <section className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4">
          <h2 className="font-medium mb-3">{t("hoa.requests.new","طلب جديد")}</h2>
          <div className="grid md:grid-cols-3 gap-2">
            <input className="px-3 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800" placeholder={t("unit","الوحدة")} value={newT.by} onChange={e => setNewT({ ...newT, by: e.target.value })}/>
            <input className="px-3 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800" placeholder={t("type","النوع")} value={newT.type} onChange={e => setNewT({ ...newT, type: e.target.value })}/>
            <button onClick={add} className="px-4 py-2 rounded-xl bg-[var(--brand-700,#0f766e)] text-white">{t("create","إرسال")}</button>
          </div>
          <p className="text-xs text-neutral-500 mt-2">{t("hint.link.tasks","اربط هذا لاحقًا بـ /api/hoa و /admin/tasks.")}</p>
        </section>
        <section className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
              <tr><th className="text-start p-3">#</th><th className="text-start p-3">{t("unit","الوحدة")}</th><th className="text-start p-3">{t("type","النوع")}</th><th className="text-start p-3">{t("status","الحالة")}</th><th className="text-start p-3">{t("date","التاريخ")}</th></tr>
            </thead>
            <tbody>{items.map((it, i) => (<tr key={it.id} className="border-t border-neutral-200 dark:border-neutral-800">
              <td className="p-3">{i+1}</td><td className="p-3">{it.by}</td><td className="p-3">{it.type}</td><td className="p-3"><StatusBadge status={it.status} /></td><td className="p-3">{it.createdAt}</td></tr>))}</tbody>
          </table>
        </section>
      </div>
    </Layout>
  );
}
