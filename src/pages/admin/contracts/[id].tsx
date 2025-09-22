// src/pages/admin/contracts/[id].tsx
import Head from "next/head";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type Booking = {
  id:string; bookingNumber:string; status:string;
  startDate:string; durationMonths:number; totalRent:number;
  contractSnapshot?: { templateName:string; bodyAr:string; bodyEn:string; fields:Record<string,string> };
};

function render(body: string, fields: Record<string, string>) {
  let out = body || "";
  Object.entries(fields || {}).forEach(([k, v]) => {
    out = out.replace(new RegExp(`{{\\s*${k}\\s*}}`, "g"), String(v || ""));
  });
  return out;
}

export default function AdminContractPage(){
  const { query } = useRouter();
  const raw = String(Array.isArray(query.id)? query.id[0] : query.id || "");
  const [b,setB]=useState<Booking|null>(null);
  const [loading,setLoading]=useState(true);
  const [err,setErr]=useState<string|null>(null);

  useEffect(()=>{ if(!raw) return;
    (async()=>{
      setLoading(true); setErr(null);
      try{
        // جلب بالمعرّف أولًا
        let r = await fetch(`/api/bookings/${encodeURIComponent(raw)}`);
        let d:any = r.ok? await r.json() : null;
        // إن لم يوجد، جرّب برقم الحجز
        if(!d?.item){
          const rr = await fetch(`/api/bookings?number=${encodeURIComponent(raw)}`);
          const dj = rr.ok? await rr.json(): null;
          const item = Array.isArray(dj?.items)? dj.items.find((x:any)=>x.bookingNumber===raw || x.id===raw) : null;
          d = item ? { item } : null;
        }
        if(!d?.item) throw 0;
        setB(d.item);
      }catch{ setErr("تعذّر جلب البيانات"); } finally{ setLoading(false); }
    })();
  },[raw]);

  const ar = useMemo(()=> render(b?.contractSnapshot?.bodyAr||"", b?.contractSnapshot?.fields||{}), [b]);
  const en = useMemo(()=> render(b?.contractSnapshot?.bodyEn||"", b?.contractSnapshot?.fields||{}), [b]);

  return (
    <div className="min-h-screen flex flex-col">
      <Head><title>عقد #{raw}</title></Head>
      <Header />
      <main className="container mx-auto p-4 flex-1 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">عقد #{b?.bookingNumber || raw}</h1>
          <Link href="/dashboard" className="btn">رجوع</Link>
        </div>

        {loading? <div>جارٍ التحميل…</div> : err? <div className="text-red-600">{err}</div> : b ? (
          <>
            <div className="border rounded-2xl p-3">
              <div className="font-semibold">النص العربي</div>
              <div className="text-sm whitespace-pre-wrap">{ar}</div>
            </div>
            <div className="border rounded-2xl p-3">
              <div className="font-semibold">English</div>
              <div className="text-sm whitespace-pre-wrap">{en}</div>
            </div>
            <div className="border rounded-2xl p-3 space-y-1 text-sm">
              <div>الحالة: {b.status}</div>
              <div>بداية: {new Date(b.startDate).toLocaleDateString("ar-OM")} • مدة: {b.durationMonths} شهر</div>
              <div>القيمة الإجمالية: {b.totalRent}</div>
            </div>
          </>
        ) : <div>لا يوجد عقد.</div>}
      </main>
      <Footer />
    </div>
  );
}
