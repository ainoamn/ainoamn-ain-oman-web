// src/pages/admin/accounting/review/[id].tsx
import Head from "next/head";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type Booking = {
  id:string; bookingNumber:string; startDate:string; endDate?:string; durationMonths:number; status:string;
  totalRent:number; deposit?:number; municipalityFee3pct?:number;
  paymentMethod?:string; cheque?:{ chequeNo:string; chequeDate:string; amount:number; status:string }|null;
  tenant:{ name:string; phone:string };
};

function daysLeft(to?:string){ if(!to) return null; const ms=(new Date(to).getTime()-Date.now()); return Math.ceil(ms/86400000); }

export default function AccountingReviewPage(){
  const { query } = useRouter();
  const id = String(Array.isArray(query.id)? query.id[0] : query.id);
  const [b,setB]=useState<Booking|null>(null);
  const [loading,setLoading]=useState(true);

  useEffect(()=>{ if(!id) return;
    (async()=>{
      setLoading(true);
      const r = await fetch(`/api/bookings/${encodeURIComponent(id)}`);
      const d = r.ok? await r.json():null;
      setB(d?.item||null);
      setLoading(false);
    })();
  },[id]);

  async function confirm(){
    const r = await fetch(`/api/bookings/${encodeURIComponent(id)}`, { method:"PATCH", headers:{ "content-type":"application/json" }, body: JSON.stringify({ action:"accountingConfirm" }) });
    if(r.ok){ window.location.href = `/admin/bookings/${encodeURIComponent(id)}`; }
  }

  const left = useMemo(()=>daysLeft(b?.endDate), [b?.endDate]);

  return (
    <div className="min-h-screen flex flex-col">
      <Head><title>مراجعة محاسبية</title></Head>
      <Header />
      <main className="container mx-auto p-4 flex-1 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">مراجعة محاسبية للحجز #{b?.bookingNumber}</h1>
          <Link href="/dashboard" className="btn">لوحة التحكم</Link>
        </div>

        {loading? <div>جارٍ التحميل…</div> : b ? (
          <div className="space-y-3">
            <div className="grid sm:grid-cols-3 gap-2 text-sm">
              <Info label="المبلغ الإجمالي" value={`${b?.totalRent || 0} OMR`} />
              <Info label="التأمين" value={`${b?.deposit || 0} OMR`} />
              <Info label="رسوم البلدية 3%" value={`${b?.municipalityFee3pct || 0} OMR`} />
              <Info label="طريقة الدفع" value={b?.paymentMethod || "-"} />
              {b?.paymentMethod==="cheque" && <Info label="رقم الشيك" value={b?.cheque?.chequeNo} />}
              {b?.paymentMethod==="cheque" && <Info label="حالة الشيك" value={b?.cheque?.status} />}
            </div>
            <button className="btn btn-primary" onClick={confirm}>تأكيد الاستلام وإرسال للإدارة</button>
            {typeof left==="number" && (
              <div className={`p-2 rounded ${left<=0?'bg-red-100':left<=30?'bg-red-50':left<=60?'bg-yellow-50':left<=90?'bg-amber-50':'bg-green-50'}`}>
                متبقي {left} يومًا لانتهاء العقد
              </div>
            )}
          </div>
        ) : <div>لا يوجد حجز.</div>}
      </main>
      <Footer />
    </div>
  );
}

function Info({label,value}:{label:string;value?:string}){
  return <div className="border rounded p-2 bg-white"><div className="text-xs text-gray-500">{label}</div><div className="font-medium">{value||"-"}</div></div>;
}
