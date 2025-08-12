import Head from "next/head";
    import Header from "@/components/layout/Header";
    import Footer from "@/components/layout/Footer";
    import { useI18n } from "@/lib/i18n";
    import React from "react";
    import { useMemo, useState } from "react";
type Task = { id:string; title:string; status:"open"|"in_progress"|"done"; assignee?:string; due?:string; };
const MOCK: Task[] = [
  {"id":"TSK-1001","title":"مراجعة صور العقارات","status":"open","assignee":"فريق التسويق","due":"2025-08-15"},
  {"id":"TSK-1002","title":"تجربة نظام المزايدات","status":"in_progress","assignee":"الفريق التقني","due":"2025-08-18"},
  {"id":"TSK-1003","title":"إطلاق صفحة الشركاء","status":"done","assignee":"الواجهة الأمامية","due":"2025-08-10"},
];
export function Content(){
  const [filter,setFilter]=useState("all");
  const list = useMemo(()=>MOCK.filter(t=> filter==="all"?true:t.status===filter),[filter]);
  return (
    <section className="py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-slate-900">المهام</h1>
          <select value={filter} onChange={e=>setFilter(e.target.value)} className="rounded-xl border px-3 py-2 text-sm">
            <option value="all">الكل</option><option value="open">مفتوحة</option><option value="in_progress">قيد التنفيذ</option><option value="done">منجزة</option>
          </select>
        </div>
        <div className="grid gap-4">
          {list.map(t=> (
            <div key={t.id} className="rounded-2xl border bg-white p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-900">{t.title}</h3>
                <span className="text-xs rounded-full px-2 py-0.5 ring-1 ring-slate-200">
                  {t.status==="done"?"منجزة":t.status==="in_progress"?"قيد التنفيذ":"مفتوحة"}
                </span>
              </div>
              <p className="text-sm text-slate-600 mt-1">المسؤول: {t.assignee||"غير محدد"} — الاستحقاق: {t.due||"—"}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

    export default function Page() {
      const { dir } = useI18n();
      return (
        <main dir={dir} className="min-h-screen bg-slate-50 flex flex-col">
          <Head><title>المهام | Ain Oman</title></Head>
          <Header />
          <div className="flex-1">
            <Content />
          </div>
          <Footer />
        </main>
      );
    }