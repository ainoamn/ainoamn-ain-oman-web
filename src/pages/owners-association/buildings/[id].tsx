import React, { useState } from "react";
import Head from "next/head"; import Layout from "@/components/layout/Layout";
import { useTSafe } from "@/lib/i18n-safe"; import HoaNav from "@/components/hoa/HoaNav";
type Unit = { id: string; name: string; owner?: string; area?: number; balance?: number; forRent?: boolean };

export default function BuildingDetail() {
  const { t, dir } = useTSafe();
  const [units, setUnits] = useState<Unit[]>([
    { id: "U-101", name: "شقة 101", owner: "أحمد", area: 120, balance: 0 },
    { id: "U-102", name: "شقة 102", owner: "سمية", area: 115, balance: 72.5 },
  ]);
  const [form, setForm] = useState<Unit>({ id: "", name: "", owner: "", area: 0 });
  const [delegation, setDelegation] = useState({ enabled: false, delegateName: "", start: "", end: "" });

  const addUnit = () => { if (!form.name) return; const id = "U-" + Math.random().toString(36).slice(2,6).toUpperCase(); setUnits(prev => [...prev, { ...form, id }]); setForm({ id: "", name: "", owner: "", area: 0 }); };
  const toggleRent = (id: string) => { setUnits(prev => prev.map(u => u.id === id ? { ...u, forRent: !u.forRent } : u)); };

  return (
    <Layout>
      <Head><title>{t("hoa.building.detail","تفاصيل المبنى")}</title></Head>
      <div dir={dir} className="space-y-6">
        <HoaNav />
        <h1 className="text-2xl font-semibold">{t("hoa.building.detail","تفاصيل المبنى")}</h1>

        <section className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4">
          <h2 className="font-medium mb-3">{t("hoa.unit.add","إضافة وحدة")}</h2>
          <div className="grid md:grid-cols-4 gap-2">
            <input className="px-3 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800" placeholder={t("unit.name","اسم الوحدة")} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}/>
            <input className="px-3 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800" placeholder={t("owner","المالك")} value={form.owner} onChange={e => setForm({ ...form, owner: e.target.value })}/>
            <input type="number" className="px-3 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800" placeholder={t("area","المساحة")} value={form.area || 0} onChange={e => setForm({ ...form, area: Number(e.target.value || 0) })}/>
            <button onClick={addUnit} className="px-3 py-2 rounded-xl bg-[var(--brand-700,#0f766e)] text-white">{t("add","إضافة")}</button>
          </div>
          <p className="text-xs text-neutral-500 mt-2">{t("hint.docs","يمكن إرفاق مستندات لكل وحدة لاحقًا.")}</p>
        </section>

        <section className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4">
          <h2 className="font-medium mb-3">{t("hoa.delegation","تفويض إدارة لطرف ثالث")}</h2>
          <div className="grid md:grid-cols-4 gap-2 items-center">
            <label className="flex items-center gap-2"><input type="checkbox" checked={delegation.enabled} onChange={e=>setDelegation({...delegation, enabled:e.target.checked})}/><span>{t("enable","تفعيل")}</span></label>
            <input className="px-3 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800" placeholder={t("delegate.name","اسم الجهة")} value={delegation.delegateName} onChange={e=>setDelegation({...delegation, delegateName:e.target.value})}/>
            <input type="date" className="px-3 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800" value={delegation.start} onChange={e=>setDelegation({...delegation, start:e.target.value})}/>
            <input type="date" className="px-3 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800" value={delegation.end} onChange={e=>setDelegation({...delegation, end:e.target.value})}/>
          </div>
          <p className="text-xs text-neutral-500 mt-2">{t("hint.delegation","عند التفعيل ستظهر معلومات الجهة في صفحة العقار والوحدات.")}</p>
        </section>

        <section className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
              <tr><th className="text-start p-3">#</th><th className="text-start p-3">{t("unit","الوحدة")}</th><th className="text-start p-3">{t("owner","المالك")}</th><th className="text-start p-3">{t("area","المساحة")}</th><th className="text-start p-3">{t("rent","الإيجار")}</th><th className="text-start p-3">{t("actions","إجراءات")}</th></tr>
            </thead>
            <tbody>
              {units.map((u,i)=>(
                <tr key={u.id} className="border-t border-neutral-200 dark:border-neutral-800">
                  <td className="p-3">{i+1}</td><td className="p-3">{u.name}</td><td className="p-3">{u.owner || "—"}</td><td className="p-3">{u.area ?? "—"}</td>
                  <td className="p-3">{u.forRent ? t("listed","معروض") : t("not.listed","غير معروض")}</td>
                  <td className="p-3"><button onClick={()=>toggleRent(u.id)} className="text-sm underline">{u.forRent ? t("unlist","إلغاء العرض") : t("list","عرض للوحدات")}</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </Layout>
  );
}
