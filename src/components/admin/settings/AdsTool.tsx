// src/components/admin/settings/AdsTool.tsx
import { useEffect, useState } from "react";
type Placement = { html?: string; imageUrl?: string; link?: string; enabled?: boolean };
type Ads = { bannerTop?: Placement; sidebar?: Placement; modal?: Placement };
function AdsTool(){
  const [v,setV]=useState<Ads>({ bannerTop:{}, sidebar:{}, modal:{} });
  const [saving,setSaving]=useState(false);

  useEffect(()=>{ (async()=>{
    const r=await fetch("/api/admin/dev/ads"); const j=await r.json().catch(()=>({}));
    setV({ bannerTop:{}, sidebar:{}, modal:{}, ...j });
  })(); },[]);

  async function save(e:any){ e?.preventDefault?.(); setSaving(true);
    await fetch("/api/admin/dev/ads",{ method:"PUT", headers:{ "Content-Type":"application/json" }, body:JSON.stringify(v) });
    setSaving(false);
  }

  function Field({label,slot}:{label:string;slot:any}){return <label className="flex flex-col gap-1">{label}{slot}</label>}

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="mb-3 text-base font-semibold text-slate-900">أداة التحكم بالإعلانات</h3>
      {(["bannerTop","sidebar","modal"] as const).map((k)=>(
        <div key={k} className="mb-4 rounded-xl border border-slate-100 p-3">
          <div className="mb-2 text-sm font-semibold text-slate-900">{k}</div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <label className="flex items-center gap-2"><input type="checkbox" checked={!!(v as any)[k]?.enabled} onChange={(e)=>setV({...v,[k]:{...(v as any)[k], enabled:e.target.checked}})}/> تفعيل</label>
            <Field label="رابط الصورة" slot={<input className="rounded-xl border p-2" value={(v as any)[k]?.imageUrl||""} onChange={(e)=>setV({...v,[k]:{...(v as any)[k], imageUrl:e.target.value}})} placeholder="https://…/ad.jpg"/>}/>
            <Field label="الرابط عند النقر" slot={<input className="rounded-xl border p-2" value={(v as any)[k]?.link||""} onChange={(e)=>setV({...v,[k]:{...(v as any)[k], link:e.target.value}})} placeholder="https://example.com"/>}/>
            <Field label="HTML مخصص" slot={<textarea rows={4} className="rounded-xl border p-2 font-mono" value={(v as any)[k]?.html||""} onChange={(e)=>setV({...v,[k]:{...(v as any)[k], html:e.target.value}})} placeholder="<div>…</div>"/>}/>
          </div>
        </div>
      ))}
      <button disabled={saving} onClick={save} className="rounded-xl border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-50">{saving?"جارٍ الحفظ…":"حفظ"}</button>
    </section>
  );
}
