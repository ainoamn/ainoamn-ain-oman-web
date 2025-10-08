// src/pages/profile/contracts/index.tsx
import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";
// Header and Footer are now handled by MainLayout in _app.tsx

type Contract = { id:string; contractNumber:string; startDate?:string; endDate?:string; status:string; totals?:{amount:number;currency?:string}; };

function dstr(s?:string){ if(!s) return "-"; const d=new Date(s); return d.toLocaleDateString('ar', { calendar: 'gregory', numberingSystem: 'latn', year:"numeric",month:"2-digit",day:"2-digit"}); }
function money(a?:number,c="OMR"){ return new Intl.NumberFormat("ar-OM",{style:"currency",currency:c,maximumFractionDigits:3}).format(Number(a||0)); }

export default function ProfileContracts(){
  const [items,setItems]=useState<Contract[]>([]);
  const [loading,setLoading]=useState(true);

  useEffect(()=>{ (async()=>{
    setLoading(true);
    try{
      const r = await fetch("/api/contracts"); const d = r.ok? await r.json():{items:[]};
      // يمكنك لاحقًا تمرير tenantId لتصفية عقود مستخدم معيّن
      setItems(Array.isArray(d?.items)? d.items : []);
    } finally { setLoading(false); }
  })(); },[]);

  return (
    <div className="min-h-screen flex flex-col">
      <Head><title>عقودي</title></Head>
      <main className="container mx-auto p-4 flex-1 space-y-4">
        <h1 className="text-xl font-semibold">عقودي</h1>
        {loading? <div>جارٍ التحميل…</div> :
          <div className="overflow-auto">
            <table className="w-full text-sm border">
              <thead>
                <tr className="border-b bg-gray-50"><th className="p-2 text-left">الرقم</th><th className="p-2 text-left">البداية</th><th className="p-2 text-left">النهاية</th><th className="p-2 text-left">القيمة</th><th className="p-2 text-left">الحالة</th><th className="p-2 text-left">إجراءات</th></tr>
              </thead>
              <tbody>
                {items.map(c=>(
                  <tr key={c.id} className="border-b">
                    <td className="p-2">{c.contractNumber}</td>
                    <td className="p-2">{dstr(c.startDate)}</td>
                    <td className="p-2">{dstr(c.endDate)}</td>
                    <td className="p-2">{money(c.totals?.amount, c.totals?.currency||"OMR")}</td>
                    <td className="p-2">{c.status}</td>
                    <td className="p-2"><Link href={`/profile/contracts/${encodeURIComponent(c.id)}`} className="btn btn-outline">عرض/اعتماد</Link></td>
                  </tr>
                ))}
                {items.length===0 && <tr><td className="p-3 text-center text-gray-600" colSpan={6}>لا توجد عقود.</td></tr>}
              </tbody>
            </table>
          </div>
        }
      </main>
    </div>
  );
}
