import Head from "next/head";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useEffect, useMemo, useState } from "react";
import { useI18n } from "@/lib/i18n";

type Period = "/mo" | "/yr";
type Plan = { id:string; name:string; priceOMR:number; period:Period; annualDiscountPercent?:number; highlight?:boolean; description?:string; icon?:string; capabilities?:Record<string,any> };
type PriceView = "monthly"|"yearly";
type SessionUser = { id:string; name:string } | null;

const DEFAULT_ANNUAL = 10;
function annualPrice(monthly:number, disc?:number){ const d = Number.isFinite(disc)? Number(disc): DEFAULT_ANNUAL; return Number((monthly*12*(1-d/100)).toFixed(3)); }

export default function SubscriptionsPage(){
  const { dir } = useI18n();
  const [user,setUser]=useState<SessionUser>(null);
  const [plans,setPlans]=useState<Plan[]>([]);
  const [priceView,setPriceView]=useState<PriceView>("monthly");
  const [coupon,setCoupon]=useState("");
  const [payMethod,setPayMethod]=useState<"online"|"bank"|"admin">("online");
  const [busy,setBusy]=useState<string|null>(null);

  useEffect(()=>{
    fetch("/api/session").then(r=>r.json()).then(d=> setUser(d.user||null));
    fetch("/api/plans").then(r=>r.json()).then(d=> setPlans(d.items||[]));
  },[]);

  const prices = useMemo(()=> {
    const map: Record<string,{monthly:number; yearly:number}> = {};
    for(const p of plans){ map[p.id] = { monthly: p.priceOMR, yearly: annualPrice(p.priceOMR, p.annualDiscountPercent) }; }
    return map;
  },[plans]);

  const buy = async (plan:Plan)=>{
    if(!user){ alert("سجّل الدخول أولًا"); return; }
    setBusy(plan.id);
    try{
      const billingPeriod:Period = priceView==="yearly"? "/yr" : "/mo";
      const r = await fetch("/api/subscriptions",{ method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify({
        planId:plan.id, billingPeriod, couponCode: coupon.trim()||undefined,
        payment: { method: payMethod, status: payMethod==="online"? "paid" : "pending" }
      }) });
      if(!r.ok){ const e=await r.json().catch(()=>({})); alert(`فشل الطلب${e?.error? `: ${e.error}`:""}`); return; }
      const { item } = await r.json();
      alert(payMethod==="online" ? "تم تفعيل الاشتراك فورًا" : "تم إرسال الطلب للمراجعة");
    } finally{ setBusy(null); }
  };

  return (
    <main dir={dir} className="min-h-screen bg-slate-50 flex flex-col">
      <Head><title>الاشتراكات</title></Head>
      <Header />

      <div className="container mx-auto px-4 py-8 flex-1 w-full">
        {!user && (
          <div className="mb-6 p-4 rounded-xl border bg-amber-50">
            <div className="font-semibold mb-1">الرجاء تسجيل الدخول</div>
            <div className="text-sm text-slate-700">لا يمكنك طلب اشتراك قبل تسجيل الدخول.</div>
            <div className="mt-3 flex gap-2">
              <a href="/login" className="px-3 py-2 rounded bg-slate-800 text-white">تسجيل الدخول</a>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">اختر الباقة</h1>
          <div className="flex items-center gap-3">
            <div className="text-sm">طريقة الدفع:</div>
            <select className="border rounded px-2 py-1" value={payMethod} onChange={e=> setPayMethod(e.target.value as any)}>
              <option value="online">دفع إلكتروني</option>
              <option value="bank">تحويل بنكي</option>
              <option value="admin">عن طريق الإدارة</option>
            </select>
            <div className="ms-4 text-sm">عرض الأسعار:</div>
            <div className="inline-flex border rounded overflow-hidden">
              <button onClick={()=> setPriceView("monthly")} className={`px-3 py-1 ${priceView==="monthly"?"bg-slate-800 text-white":"bg-white"}`}>شهري</button>
              <button onClick={()=> setPriceView("yearly")} className={`px-3 py-1 ${priceView==="yearly"?"bg-slate-800 text-white":"bg-white"}`}>سنوي</button>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <input className="border rounded px-3 py-2 w-64" placeholder="كود خصم (اختياري)" value={coupon} onChange={e=> setCoupon(e.target.value.toUpperCase())}/>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {plans.map(p=>{
            const pv = prices[p.id]||{ monthly:p.priceOMR, yearly: annualPrice(p.priceOMR, p.annualDiscountPercent) };
            const price = priceView==="yearly"? pv.yearly: pv.monthly;
            const subtext = priceView==="yearly" ? `بدل ${(p.priceOMR*12).toFixed(3)} ر.ع سنويًا` : "شهري";
            return (
              <div key={p.id} className={`rounded-2xl p-5 shadow bg-white border ${p.highlight? "border-teal-500": "border-slate-200"}`}>
                <div className="flex items-center gap-3 mb-2">
                  {p.icon?.startsWith("http")? <img src={p.icon} alt="" className="w-8 h-8 rounded"/> : <span className="text-3xl">{p.icon||"•"}</span>}
                  <div className="text-lg font-semibold">{p.name} {p.highlight? "⭐": ""}</div>
                </div>
                <div className="text-slate-600 text-sm mb-2">{p.description}</div>
                <div className="text-2xl font-bold mb-1">{price} <span className="text-base font-normal">ر.ع</span></div>
                <div className="text-xs text-slate-500 mb-3">{subtext}</div>
                <ul className="text-sm list-disc ps-5 space-y-1 mb-4">
                  <li>إنشاء مزادات: {p.capabilities?.includesCreateAuction? "مسموح": "غير مسموح"}</li>
                  <li>إعلانات مميزة: {p.capabilities?.includesFeaturedAds? "مسموح": "غير مسموح"}</li>
                  <li>عدد الإعلانات: {p.capabilities?.maxListings ?? 0}</li>
                </ul>
                <button disabled={!user || busy===p.id} onClick={()=> buy(p)} className={`w-full px-4 py-2 rounded ${!user? "bg-slate-300 text-slate-600" : "bg-teal-600 text-white"}`}>
                  {!user? "سجّل الدخول أولًا" : busy===p.id? "جاري المعالجة..." : "اشترك الآن"}
                </button>
              </div>
            );
          })}
          {plans.length===0 && <div className="text-slate-500">لا توجد باقات متاحة.</div>}
        </div>
      </div>

      <Footer />
    </main>
  );
}
