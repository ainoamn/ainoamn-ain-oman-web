// src/pages/admin/contracts/[id].tsx
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

type Contract = {
  id:string; contractNumber:string; scope:"unified"|"per-unit"; propertyId?:string;
  templateId:string; fields:Record<string,string>;
  parties:{ owner:{name:string;phone?:string;email?:string}; tenant:{name:string;phone?:string;email?:string;userId?:string} };
  startDate?:string; durationMonths?:number; endDate?:string; status:"draft"|"sent"|"approved"|"rejected"|"active"|"cancelled";
  totals?:{amount:number;currency?:string};
};
type Template = { id:string; name:string; bodyAr:string; bodyEn:string; fields:{key:string;labelAr:string;labelEn:string}[] };
function money(a?:number,c="OMR"){ return new Intl.NumberFormat("ar-OM",{style:"currency",currency:c,maximumFractionDigits:3}).format(Number(a||0)); }
function dstr(s?:string){ if(!s) return "-"; const d=new Date(s); return d.toLocaleDateString("ar-OM",{year:"numeric",month:"2-digit",day:"2-digit"}); }

export default function AdminContractDetails(){
  const { query } = useRouter(); const id = Array.isArray(query.id)? query.id[0] : query.id;
  const [c,setC]=useState<Contract|null>(null); const [t,setT]=useState<Template|null>(null);
  const [loading,setLoading]=useState(true); const [err,setErr]=useState<string|null>(null);
  const [reason,setReason]=useState("");

  useEffect(()=>{ if(!id) return;
    (async()=>{
      setLoading(true); setErr(null);
      try{
        const cr = await fetch(`/api/contracts/${encodeURIComponent(String(id))}`); if(!cr.ok) throw 0;
        const cjs = await cr.json(); setC(cjs?.item||null);
        if(cjs?.item?.templateId){
          const tr = await fetch(`/api/contract-templates/${encodeURIComponent(cjs.item.templateId)}`); if(tr.ok){ const tjs=await tr.json(); setT(tjs?.item||null); }
        }
      }catch{ setErr("تعذّر جلب البيانات"); } finally{ setLoading(false); }
    })();
  },[id]);

  const previewAr = useMemo(()=>render(t?.bodyAr||"", c?.fields||{}),[t,c]);
  const previewEn = useMemo(()=>render(t?.bodyEn||"", c?.fields||{}),[t,c]);

  async function action(a:"send"|"ownerApprove"|"ownerReject"){
    if(!id) return;
    const body:any = { action:a }; if(a==="ownerReject") body.reason = reason;
    const r = await fetch(`/api/contracts/${encodeURIComponent(String(id))}`, { method:"PATCH", headers:{ "content-type":"application/json" }, body: JSON.stringify(body) });
    const d = await r.json();
    if(r.ok){ setC(d?.item||null); if(a==="send") alert("تم إرسال العقد للمستأجر لاعتماده."); }
    else alert(d?.error || "فشل العملية");
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Head><title>عقد #{c?.contractNumber || ""}</title></Head>
      <Header />
      <main className="container mx-auto p-4 flex-1 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">عقد #{c?.contractNumber}</h1>
          <Link href="/admin/contracts" className="btn">رجوع</Link>
        </div>

        {loading? <div>جارٍ التحميل…</div> : err? <div className="text-red-600">{err}</div> : c ? (
          <div className="grid lg:grid-cols-3 gap-4">
            <section className="border rounded-2xl p-3 space-y-2">
              <div className="font-semibold">البيانات</div>
              <div className="grid text-sm">
                <Info label="النطاق" value={c.scope==="unified"?"موحّد":"لوحدة"} />
                <Info label="الوحدة" value={c.propertyId || "-"} />
                <Info label="المالك" value={c.parties?.owner?.name} />
                <Info label="المستأجر" value={c.parties?.tenant?.name} />
                <Info label="بداية" value={dstr(c.startDate)} />
                <Info label="نهاية" value={dstr(c.endDate)} />
                <Info label="المدة" value={String(c.durationMonths||"-")} />
                <Info label="القيمة" value={money(c.totals?.amount, c.totals?.currency||"OMR")} />
                <Info label="الحالة" value={c.status} />
              </div>

              <div className="space-y-2">
                <button className="btn btn-primary w-full" onClick={()=>action("send")}>إرسال للمستأجر للاعتماد</button>
                <button className="btn w-full" onClick={()=>action("ownerApprove")}>اعتماد المالك</button>
                <div className="grid grid-cols-4 gap-2">
                  <input className="form-input col-span-3" placeholder="سبب الرفض" value={reason} onChange={e=>setReason(e.target.value)} />
                  <button className="btn btn-danger" onClick={()=>action("ownerReject")}>رفض</button>
                </div>
              </div>
            </section>

            <section className="lg:col-span-2 space-y-3">
              <div className="border rounded-2xl p-3">
                <div className="font-semibold">النص العربي</div>
                <div className="text-sm whitespace-pre-wrap">{previewAr}</div>
              </div>
              <div className="border rounded-2xl p-3">
                <div className="font-semibold">English Text</div>
                <div className="text-sm whitespace-pre-wrap">{previewEn}</div>
              </div>
              <div className="text-sm text-gray-600">ملاحظة: يتم استبدال الحقول بين {{ }} بالقيم المُدخلة.</div>
              <Link href={`/profile/contracts/${encodeURIComponent(c.id)}`} className="inline-block btn btn-outline">رابط المستأجر للمعاينة/الاعتماد</Link>
            </section>
          </div>
        ) : <div>لا يوجد عقد.</div>}
      </main>
      <Footer />
    </div>
  );
}

function Info({label,value}:{label:string;value?:string}){ return (
  <div className="flex items-center justify-between py-1"><span className="text-gray-500">{label}</span><span className="font-medium">{value||"-"}</span></div>
);}

function render(body:string, fields:Record<string,string>){
  let out = body || "";
  Object.entries(fields||{}).forEach(([k,v])=>{
    const re = new RegExp(`{{\\s*${k}\\s*}}`,"g");
    out = out.replace(re, String(v||""));
  });
  return out;
}
