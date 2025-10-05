// src/pages/profile/contracts/[id].tsx
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

type Contract = {
  id:string; contractNumber:string; templateId:string; fields:Record<string,string>;
  startDate?:string; endDate?:string; durationMonths?:number; status:string;
  parties:{ owner:{name:string}; tenant:{name:string;phone?:string;email?:string} };
};
type Template = { id:string; name:string; bodyAr:string; bodyEn:string; fields:{key:string;labelAr:string;labelEn:string}[] };

function dstr(s?:string){ if(!s) return "-"; const d=new Date(s); return d.toLocaleDateString("ar-OM",{year:"numeric",month:"2-digit",day:"2-digit"}); }

export default function TenantContractView(){
  const { query } = useRouter(); const id = Array.isArray(query.id)? query.id[0] : query.id;
  const [c,setC]=useState<Contract|null>(null); const [t,setT]=useState<Template|null>(null);
  const [loading,setLoading]=useState(true); const [err,setErr]=useState<string|null>(null); const [reason,setReason]=useState("");

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

  async function approve(){
    if(!id) return;
    const r = await fetch(`/api/contracts/${encodeURIComponent(String(id))}`, { method:"PATCH", headers:{ "content-type":"application/json" }, body: JSON.stringify({ action:"tenantApprove" }) });
    if(r.ok){ alert("تمت الموافقة على العقد."); window.location.reload(); } else { const d=await r.json(); alert(d?.error||"فشل الموافقة"); }
  }
  async function reject(){
    if(!id) return; if(!reason.trim()) return alert("اكتب سبب الرفض");
    const r = await fetch(`/api/contracts/${encodeURIComponent(String(id))}`, { method:"PATCH", headers:{ "content-type":"application/json" }, body: JSON.stringify({ action:"tenantReject", reason }) });
    if(r.ok){ alert("تم رفض العقد."); window.location.reload(); } else { const d=await r.json(); alert(d?.error||"فشل الرفض"); }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Head><title>العقد #{c?.contractNumber||""}</title></Head>
      <Header />
      <main className="container mx-auto p-4 flex-1 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">العقد #{c?.contractNumber}</h1>
          <Link href="/profile/contracts" className="btn">رجوع</Link>
        </div>

        {loading? <div>جارٍ التحميل…</div> : err? <div className="text-red-600">{err}</div> : c ? (
          <>
            <div className="grid sm:grid-cols-3 gap-2 text-sm">
              <Info label="المالك" value={c.parties?.owner?.name} />
              <Info label="المستأجر" value={c.parties?.tenant?.name} />
              <Info label="البداية" value={dstr(c.startDate)} />
              <Info label="النهاية" value={dstr(c.endDate)} />
              <Info label="المدة" value={String(c.durationMonths||"-")} />
              <Info label="الحالة" value={c.status} />
            </div>

            <section className="border rounded-2xl p-3 space-y-3">
              <div className="font-semibold">النص العربي</div>
              <div className="text-sm whitespace-pre-wrap">{previewAr}</div>
            </section>
            <section className="border rounded-2xl p-3 space-y-3">
              <div className="font-semibold">English Text</div>
              <div className="text-sm whitespace-pre-wrap">{previewEn}</div>
            </section>

            <div className="grid sm:grid-cols-4 gap-2">
              <button className="btn btn-primary sm:col-span-1" onClick={approve}>أوافق</button>
              <input className="form-input sm:col-span-2" placeholder="سبب الرفض" value={reason} onChange={e=>setReason(e.target.value)} />
              <button className="btn btn-danger sm:col-span-1" onClick={reject}>أرفض</button>
            </div>
          </>
        ) : <div>لا يوجد عقد.</div>}
      </main>
      <Footer />
    </div>
  );
}

function Info({label,value}:{label:string;value?:string}){ return (
  <div className="border rounded-lg p-2 bg-white"><div className="text-xs text-gray-500">{label}</div><div className="font-medium">{value||"-"}</div></div>
);}

function render(body:string, fields:Record<string,string>){
  let out = body || "";
  Object.entries(fields||{}).forEach(([k,v])=>{
    const re = new RegExp(`{{\\s*${k}\\s*}}`,"g");
    out = out.replace(re, String(v||""));
  });
  return out;
}
