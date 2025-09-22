// src/pages/admin/accounting/review/[id].tsx
import Head from "next/head";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Link from "next/link";

type Booking = {
  id:string; bookingNumber:string; status:string;
  startDate:string; durationMonths:number; totalRent:number;
};

export default function AccountingReviewPage(){
  const { query } = useRouter();
  const raw = String(Array.isArray(query.id)? query.id[0] : query.id || "");
  const [b,setB]=useState<Booking|null>(null);
  const [loading,setLoading]=useState(true);
  const [err,setErr]=useState<string|null>(null);

  useEffect(()=>{ if(!raw) return;
    (async()=>{
      setLoading(true); setErr(null);
      try{
        let r = await fetch(`/api/bookings/${encodeURIComponent(raw)}`);
        let d:any = r.ok? await r.json() : null;
        if(!d?.item){
          const rr = await fetch(`/api/bookings?number=${encodeURIComponent(raw)}`);
          const dj = rr.ok? await rr.json(): null;
          const item = Array.isArray(dj?.items)? dj.items.find((x:any)=>x.bookingNumber===raw || x.id===raw) : null;
          d = item ? { item } : null;
        }
        if(!d?.item) throw 0;
        setB(d.item);
      }catch{ setErr("لا يوجد حجز."); } finally{ setLoading(false); }
    })();
  },[raw]);

  async function confirm(){
    if(!b) return;
    const r = await fetch(`/api/bookings/${encodeURIComponent(b.id)}`, { method:"PATCH", headers:{ "content-type":"application/json" }, body: JSON.stringify({ action:"accountingConfirm" }) });
    if(r.ok){ alert("تم التحويل إلى الإدارة"); window.location.href = `/admin/bookings/${encodeURIComponent(b.id)}`; }
    else alert("فشل الإجراء");
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Head><title>مراجعة محاسبية للحجز</title></Head>
      <Header />
      <main className="container mx-auto p-4 flex-1 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">مراجعة محاسبية للحجز #{raw}</h1>
          <Link href="/dashboard" className="btn">لوحة التحكم</Link>
        </div>

        {loading? <div>جارٍ التحميل…</div> : err? <div>{err}</div> : b ? (
          <div className="border rounded-2xl p-3 space-y-2">
            <div>رقم الحجز: {b.bookingNumber}</div>
            <div>الحالة: {b.status}</div>
            <div>بداية: {new Date(b.startDate).toLocaleDateString("ar-OM")} • مدة: {b.durationMonths} شهر</div>
            <div>القيمة الإجمالية: {b.totalRent}</div>
            <div className="flex gap-2 pt-2">
              <button className="btn btn-primary" onClick={confirm}>اعتماد محاسبي</button>
              <Link className="btn btn-outline" href={`/admin/bookings/${encodeURIComponent(b.id)}`}>تفاصيل الحجز</Link>
            </div>
          </div>
        ) : <div>لا يوجد حجز.</div>}
      </main>
      <Footer />
    </div>
  );
}
