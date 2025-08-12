import Head from "next/head";
    import Header from "@/components/layout/Header";
    import Footer from "@/components/layout/Footer";
    import { useI18n } from "@/lib/i18n";
    import React from "react";
    import Link from "next/link";
import { useMemo, useState } from "react";
type Item = { id:string; title:string; status:"draft"|"published"|"archived"; views:number; created:string; };
const ITEMS: Item[] = [
  {"id":"PR-1001","title":"شقة جديدة في مسقط","status":"published","views":234,"created":"2025-08-01"},
  {"id":"PR-1002","title":"أرض سكنية في السيب","status":"draft","views":11,"created":"2025-08-06"},
  {"id":"PR-1003","title":"فيلا فاخرة بالخوض","status":"archived","views":980,"created":"2025-07-22"},
];
export function Content(){
  const [f,setF]=useState("all");
  const list = useMemo(()=> ITEMS.filter(i=> f==="all"?true:i.status===f),[f]);
  return (
    <section className="py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-slate-900">إدارة العقارات</h1>
          <div className="flex items-center gap-3">
            <select value={f} onChange={e=>setF(e.target.value)} className="rounded-xl border px-3 py-2 text-sm">
              <option value="all">الكل</option><option value="published">منشور</option><option value="draft">مسودة</option><option value="archived">مؤرشف</option>
            </select>
            <Link href="/properties/add" className="rounded-2xl bg-teal-600 text-white px-4 py-2 text-sm font-semibold">إضافة عقار</Link>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full rounded-2xl overflow-hidden border bg-white">
            <thead className="bg-slate-100"><tr>
              <th className="px-3 py-2 text-start text-sm">المعرف</th>
              <th className="px-3 py-2 text-start text-sm">العنوان</th>
              <th className="px-3 py-2 text-start text-sm">الحالة</th>
              <th className="px-3 py-2 text-start text-sm">الزيارات</th>
              <th className="px-3 py-2 text-start text-sm">أضيف في</th>
              <th className="px-3 py-2 text-start text-sm">إجراءات</th>
            </tr></thead>
            <tbody>
              {list.map(i => (
                <tr key={i.id} className="border-t">
                  <td className="px-3 py-2 text-sm">{i.id}</td>
                  <td className="px-3 py-2 text-sm">{i.title}</td>
                  <td className="px-3 py-2 text-sm">{i.status==="published"?"منشور":i.status==="draft"?"مسودة":"مؤرشف"}</td>
                  <td className="px-3 py-2 text-sm">{i.views}</td>
                  <td className="px-3 py-2 text-sm">{i.created}</td>
                  <td className="px-3 py-2 text-sm">
                    <div className="flex gap-2">
                      <button className="rounded-lg border px-2 py-1 text-xs">تعديل</button>
                      <button className="rounded-lg border px-2 py-1 text-xs">نشر</button>
                      <button className="rounded-lg border px-2 py-1 text-xs">أرشفة</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

    export default function Page() {
      const { dir } = useI18n();
      return (
        <main dir={dir} className="min-h-screen bg-slate-50 flex flex-col">
          <Head><title>إدارة العقارات | Ain Oman</title></Head>
          <Header />
          <div className="flex-1">
            <Content />
          </div>
          <Footer />
        </main>
      );
    }