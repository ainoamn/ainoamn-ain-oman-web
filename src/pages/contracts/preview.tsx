// src/pages/contracts/preview.tsx
import Head from "next/head";
// Header is now handled by MainLayout in _app.tsx

import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";

type Eff = { templateId:string; templateName:string; scope:string; propertyId?:string|null; buildingId?:string|null; fields:Record<string,string>; bodyAr:string; bodyEn:string; resolvedAt:string };

export default function EffectiveContractPreview(){
  const { query } = useRouter();
  const propertyId = String(query.propertyId || "");
  const buildingId = query.buildingId ? String(query.buildingId) : undefined;
  const [eff,setEff]=useState<Eff|null>(null); const [loading,setLoading]=useState(true); const [err,setErr]=useState<string|null>(null);

  useEffect(()=>{ if(!propertyId) return;
    (async()=>{
      setLoading(true); setErr(null);
      try{
        const url = new URL("/api/contracts/effective", window.location.origin);
        url.searchParams.set("propertyId", propertyId);
        if(buildingId) url.searchParams.set("buildingId", buildingId);
        const r = await fetch(url.toString()); if(!r.ok) throw 0; const d = await r.json(); setEff(d||null);
      }catch{ setErr("تعذّر جلب العقد الفعّال"); } finally{ setLoading(false); }
    })();
  },[propertyId,buildingId]);

  const ar = useMemo(()=> render(eff?.bodyAr||"", eff?.fields||{}), [eff]);
  const en = useMemo(()=> render(eff?.bodyEn||"", eff?.fields||{}), [eff]);

  return (
    <div className="min-h-screen flex flex-col">
      <Head><title>العقد الفعّال</title></Head>
      
      <main className="container mx-auto p-4 flex-1 space-y-4">
        <h1 className="text-xl font-semibold">العقد الفعّال</h1>
        {loading? <div>جارٍ التحميل…</div> : err? <div className="text-red-600">{err}</div> : eff ? (
          <>
            <div className="text-sm text-gray-600">القالب: {eff.templateName} — النطاق: {eff.scope}</div>
            <section className="border rounded-2xl p-3 space-y-2">
              <div className="font-semibold">النص العربي</div>
              <div className="text-sm whitespace-pre-wrap">{ar}</div>
            </section>
            <section className="border rounded-2xl p-3 space-y-2">
              <div className="font-semibold">English Text</div>
              <div className="text-sm whitespace-pre-wrap">{en}</div>
            </section>
          </>
        ) : <div>لا يوجد عقد مهيأ.</div>}
      </main>
      
    </div>
  );
}
function render(body:string, fields:Record<string,string>){
  let out = body || "";
  Object.entries(fields||{}).forEach(([k,v])=>{ out = out.replace(new RegExp(`{{\\s*${k}\\s*}}`,"g"), String(v||"")); });
  return out;
}
