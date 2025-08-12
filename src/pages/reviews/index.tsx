import Head from "next/head";
    import Header from "@/components/layout/Header";
    import Footer from "@/components/layout/Footer";
    import { useI18n } from "@/lib/i18n";
    import React from "react";
    import { useMemo, useState } from "react";

type Review = { id: string; author: string; rating: number; comment: string; date: string; };
const MOCK: Review[] = [
  {"id":"RV-0001","author":"أحمد","rating":5,"comment":"تجربة ممتازة وسهلة.","date":"2025-08-01"},
  {"id":"RV-0002","author":"مريم","rating":4,"comment":"واجهة رائعة.","date":"2025-08-05"},
  {"id":"RV-0003","author":"سالم","rating":4.5,"comment":"الدعم سريع والتنبيهات مفيدة.","date":"2025-08-08"},
];

function Stars({value=0}:{value?:number}){
  const r = Math.round(value*2)/2;
  return <div className="flex items-center gap-1">
    {[1,2,3,4,5].map(i => <span key={i} className={i<=Math.floor(r)?"text-yellow-500":"text-slate-300"}>★</span>)}
    <span className="text-xs text-slate-500 ms-1">{value}</span>
  </div>;
}

export function Content(){
  const [q, setQ] = useState(""); const [min, setMin] = useState(0);
  const list = useMemo(()=> MOCK.filter(r => (r.author + r.comment).includes(q) && r.rating>=min ),[q,min]);

  return (
    <section className="py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-4">التقييمات</h1>
        <div className="grid gap-3 sm:grid-cols-3 mb-6">
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="ابحث في التعليقات أو الأسماء…" className="rounded-xl border px-3 py-2 text-sm sm:col-span-2" />
          <select value={min} onChange={e=>setMin(parseFloat(e.target.value))} className="rounded-xl border px-3 py-2 text-sm">
            <option value={0}>جميع التقييمات</option>
            <option value={3}>3+ نجوم</option>
            <option value={4}>4+ نجوم</option>
            <option value={4.5}>4.5+ نجوم</option>
          </select>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map(r => (
            <article key={r.id} className="rounded-2xl border bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-800">{r.author}</h3>
                <Stars value={r.rating} />
              </div>
              <p className="mt-2 text-sm text-slate-700">{r.comment}</p>
              <time className="mt-3 block text-xs text-slate-500">{r.date}</time>
            </article>
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
          <Head><title>التقييمات | Ain Oman</title></Head>
          <Header />
          <div className="flex-1">
            <Content />
          </div>
          <Footer />
        </main>
      );
    }