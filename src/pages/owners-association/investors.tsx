import React, { useState } from "react";
import Head from "next/head"; 
import { useTSafe } from "@/lib/i18n-safe"; import HoaNav from "@/components/hoa/HoaNav";
import type { Investor } from "@/types/hoa";

export default function InvestorsPage() {
  const { t, dir } = useTSafe();
  const [items, setItems] = useState<Investor[]>([{ id: "inv_1", name: "شركة النور", share: 22 },{ id: "inv_2", name: "Oman REIT", share: 15 }]);
  const [form, setForm] = useState<Investor>({ id: "", name: "", email: "", share: 0 });
  const add = () => { if (!form.name) return; const id = "inv_" + Math.random().toString(36).slice(2, 8); setItems(prev => [...prev, { ...form, id }]); setForm({ id: "", name: "", email: "", share: 0 }); };
  return (
    <>
      <Head><title>{t("hoa.investors.title","المستثمرون")}</title></Head>
      <div dir={dir} className="space-y-6">
        <HoaNav />
        <h1 className="text-2xl font-semibold">{t("hoa.investors.title","المستثمرون")}</h1>
        <div className="grid md:grid-cols-2 gap-4">
          <section className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4">
            <h2 className="font-medium mb-3">{t("hoa.investors.add","إضافة مستثمر")}</h2>
            <div className="grid grid-cols-1 gap-2">
              <input className="px-3 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800" placeholder={t("name","الاسم")} value={form.name || ""} onChange={e => setForm({ ...form, name: e.target.value })}/>
              <input className="px-3 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800" placeholder="email@example.com" value={form.email || ""} onChange={e => setForm({ ...form, email: e.target.value })}/>
              <input type="number" className="px-3 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800" placeholder={t("hoa.investors.share","نسبة الملكية %")} value={form.share || 0} onChange={e => setForm({ ...form, share: Number(e.target.value || 0) })}/>
              <div className="flex justify-end"><button onClick={add} className="px-4 py-2 rounded-xl bg-[var(--brand-700,#0f766e)] text-white">{t("add","إضافة")}</button></div>
            </div>
          </section>
          <section className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-0 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-neutral-50 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
                <tr><th className="text-start p-3">#</th><th className="text-start p-3">{t("name","الاسم")}</th><th className="text-start p-3">Email</th><th className="text-start p-3">{t("hoa.investors.share","النسبة %")}</th></tr>
              </thead>
              <tbody>{items.map((it, i) => (<tr key={it.id} className="border-t border-neutral-200 dark:border-neutral-800">
                <td className="p-3">{i+1}</td><td className="p-3">{it.name}</td><td className="p-3">{it.email || "—"}</td><td className="p-3">{it.share ?? "—"}</td></tr>))}</tbody>
            </table>
          </section>
        </div>
      </div>
    </>
  );
}
