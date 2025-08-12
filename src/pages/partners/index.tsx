import Head from "next/head";
    import Header from "@/components/layout/Header";
    import Footer from "@/components/layout/Footer";
    import { useI18n } from "@/lib/i18n";
    import React from "react";
    import Image from "next/image";
import Link from "next/link";
import { useMemo, useState, useEffect } from "react";

type Partner = {
  id: string; name: string; logo: string; url: string;
  category: "agency" | "developer" | "bank" | "service"; rating?: number; badges?: Array<"featured" | "verified">; description?: string;
};

const MOCK_PARTNERS: Partner[] = [
  { id: "PRT-0001", name: "شركة المها للتطوير", logo: "/images/partners/placeholder-dev.svg", url: "#", category: "developer", rating: 4.8, badges: ["featured","verified"], description: "مطور عقاري رائد بمشاريع سكنية وتجارية." },
  { id: "PRT-0002", name: "وكالة عمان للعقارات", logo: "/images/partners/placeholder-agency.svg", url: "#", category: "agency", rating: 4.5, badges: ["verified"], description: "وكالة تسويق عقاري تقدم إدارة وتأجير وبيع العقارات." },
  { id: "PRT-0003", name: "بنك الاستثمار الخليجي", logo: "/images/partners/placeholder-bank.svg", url: "#", category: "bank", rating: 4.6, badges: ["featured"], description: "حلول تمويل عقاري للأفراد والشركات." },
  { id: "PRT-0004", name: "الفحص والتقييم الذكي", logo: "/images/partners/placeholder-service.svg", url: "#", category: "service", rating: 4.2, description: "فحص وتقييم وصيانة مع تقارير معتمدة." },
];

function Stars({ value=0 }:{value?:number}){
  const r = Math.round(value*2)/2;
  return <div className="flex items-center gap-1">
    {[1,2,3,4,5].map(i => <span key={i} className={i<=Math.floor(r)?"text-yellow-500":"text-slate-300"}>★</span>)}
    <span className="text-xs text-slate-500 ms-1">{value.toFixed(1)}</span>
  </div>;
}

export function Content(){
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("all");
  const filtered = useMemo(()=>{
    const q = query.trim().toLowerCase();
    return MOCK_PARTNERS.filter(p => (category==="all"|| p.category===category) && (!q || p.name.toLowerCase().includes(q)));
  },[query,category]);

  useEffect(()=>{
    const el = document.getElementById("partners-search") as HTMLInputElement | null;
    el?.focus();
  },[]);

  return (
    <section className="py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">الشركاء</h1>
            <p className="text-slate-600 mt-1">شركاؤنا الموثوقون في قطاع العقار.</p>
          </div>
          <Link href="/contact" className="rounded-2xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white">أرسل طلب الانضمام</Link>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 mb-6">
          <input id="partners-search" type="search" placeholder="ابحث باسم الشريك…" value={query} onChange={e=>setQuery(e.target.value)} className="rounded-xl border px-3 py-2 text-sm sm:col-span-2" />
          <select value={category} onChange={e=>setCategory(e.target.value)} className="rounded-xl border px-3 py-2 text-sm">
            <option value="all">جميع الفئات</option>
            <option value="agency">وكالات</option>
            <option value="developer">مطوّرون</option>
            <option value="bank">تمويل</option>
            <option value="service">خدمات</option>
          </select>
        </div>

        {filtered.length===0? (
          <p className="rounded-xl border border-dashed bg-white p-6 text-center text-slate-600">لا توجد نتائج.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map(p => (
              <div key={p.id} className="group rounded-2xl border p-4 bg-white shadow-sm hover:shadow-md">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative h-12 w-12 overflow-hidden rounded-xl ring-1 ring-slate-200">
                      <Image src={p.logo} alt={p.name} fill sizes="48px" className="object-cover"/>
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-slate-800">{p.name}</h3>
                      <p className="text-xs text-slate-500">{p.category}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {p.badges?.includes("featured") && <span className="text-xs rounded-full bg-sky-50 text-sky-700 ring-1 ring-sky-200 px-2 py-0.5">مميز</span>}
                    {p.badges?.includes("verified") && <span className="text-xs rounded-full bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 px-2 py-0.5">موثّق</span>}
                  </div>
                </div>
                {p.description && <p className="mt-3 text-sm text-slate-600 line-clamp-3">{p.description}</p>}
                <div className="mt-4 flex items-center justify-between">
                  <Stars value={p.rating ?? 0} />
                  <Link href={p.url} className="rounded-xl border px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50">زيارة</Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

    export default function Page() {
      const { dir } = useI18n();
      return (
        <main dir={dir} className="min-h-screen bg-slate-50 flex flex-col">
          <Head><title>الشركاء | Ain Oman</title></Head>
          <Header />
          <div className="flex-1">
            <Content />
          </div>
          <Footer />
        </main>
      );
    }