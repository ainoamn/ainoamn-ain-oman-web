// src/pages/admin/contracts/index.tsx
import Head from "next/head";
import InstantLink from '@/components/InstantLink';
import { useEffect, useMemo, useState } from "react";
// Header is now handled by MainLayout in _app.tsx


type Contract = {
  id: string; contractNumber: string; scope: "unified"|"per-unit";
  propertyId?: string; templateId: string;
  startDate?: string; endDate?: string; durationMonths?: number;
  totals?: { amount: number; currency?: string };
  status: "draft"|"sent"|"approved"|"rejected"|"active"|"cancelled";
  parties: { owner:{name:string}; tenant:{name:string; phone?:string} };
};

function dstr(s?:string){ if(!s) return "-"; const d=new Date(s); return d.toLocaleDateString('ar', { calendar: 'gregory', numberingSystem: 'latn', year:"numeric",month:"2-digit",day:"2-digit"}); }
function money(a?:number,c="OMR"){ return new Intl.NumberFormat("ar-OM",{style:"currency",currency:c,maximumFractionDigits:3}).format(Number(a||0)); }
function left(to?: string){ if(!to) return null; const ms=(new Date(to).getTime()-Date.now()); return Math.ceil(ms/86400000); }

export default function AdminContractsList(){
  const [items,setItems] = useState<Contract[]>([]);
  const [loading,setLoading]=useState(true);
  const [err,setErr]=useState<string|null>(null);
  const [q,setQ]=useState("");

  useEffect(()=>{ setLoading(true); setErr(null);
    fetch("/api/contracts").then(r=>r.json()).then(d=>setItems(Array.isArray(d?.items)?d.items:[])).catch(()=>setErr("تعذّر جلب البيانات")).finally(()=>setLoading(false));
  },[]);

  const filtered = useMemo(()=> items.filter(x=> x.contractNumber.includes(q) || (x.parties?.tenant?.name||"").includes(q) ), [items,q]);

  return (
    <div className="min-h-screen flex flex-col">
      <Head><title>إدارة العقود</title></Head>
      
      <main className="container mx-auto p-4 flex-1 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">العقود</h1>
          <InstantLink href="/admin/contracts/new" className="btn btn-primary">عقد جديد</InstantLink>
        </div>

        <input className="form-input w-full max-w-sm" placeholder="بحث برقم العقد أو اسم المستأجر" value={q} onChange={e=>setQ(e.target.value)} />

        {loading? <div>جارٍ التحميل…</div> : err? <div className="text-red-600">{err}</div> : (
          <div className="overflow-auto">
            <table className="w-full text-sm border">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="p-2 text-left">رقم العقد</th>
                  <th className="p-2 text-left">النطاق</th>
                  <th className="p-2 text-left">الوحدة</th>
                  <th className="p-2 text-left">المستأجر</th>
                  <th className="p-2 text-left">البداية</th>
                  <th className="p-2 text-left">النهاية</th>
                  <th className="p-2 text-left">المتبقي</th>
                  <th className="p-2 text-left">القيمة</th>
                  <th className="p-2 text-left">الحالة</th>
                  <th className="p-2 text-left">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(c=>{
                  const days = left(c.endDate);
                  const badge = typeof days==="number" ? (
                    <span className={`px-2 py-1 rounded text-xs ${days<=0?"bg-red-100 text-red-800":days<=30?"bg-yellow-100 text-yellow-800":"bg-green-100 text-green-800"}`}>{days<=0?"منتهي":`يبقى ${days} يومًا`}</span>
                  ) : "-";
                  return (
                    <tr key={c.id} className="border-b">
                      <td className="p-2">{c.contractNumber}</td>
                      <td className="p-2">{c.scope==="unified"?"موحّد":"مخصص لوحدة"}</td>
                      <td className="p-2">{c.propertyId || "-"}</td>
                      <td className="p-2">{c.parties?.tenant?.name || "-"}</td>
                      <td className="p-2">{dstr(c.startDate)}</td>
                      <td className="p-2">{dstr(c.endDate)}</td>
                      <td className="p-2">{badge}</td>
                      <td className="p-2">{money(c.totals?.amount, c.totals?.currency||"OMR")}</td>
                      <td className="p-2">{c.status}</td>
                      <td className="p-2"><InstantLink href={`/admin/contracts/${encodeURIComponent(c.id)}`} className="btn btn-outline">فتح</InstantLink></td>
                    </tr>
                  );
                })}
                {filtered.length===0 && <tr><td className="p-3 text-center text-gray-600" colSpan={10}>لا توجد عقود.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </main>
      
    </div>
  );
}
