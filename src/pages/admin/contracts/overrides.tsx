// src/pages/admin/contracts/overrides.tsx
import Head from "next/head";
// Header is now handled by MainLayout in _app.tsx

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Template = { id:string; name:string; scope:"unified"|"per-unit"; bodyAr:string; bodyEn:string; fields:{key:string;labelAr:string;labelEn:string;required?:boolean}[] };
type Assign = { id:string; level:"building"|"unit"; refId:string; templateId:string; fieldsOverride?:Record<string,string>; updatedAt:string };
type Building = { id:string; buildingNo:string; address:string; unitsCount:number; units:{ id:string; unitNo:string }[]; published?:boolean };

function resolve(fields:Record<string,string>, body:string){ 
  let out = body||""; 
  Object.entries(fields||{}).forEach(([k,v])=>{ out = out.replace(new RegExp(`{{\\s*${k}\\s*}}`,"g"), String(v??"")); }); 
  return out; 
}

export default function OverridesPage(){
  const [templates,setTemplates]=useState<Template[]>([]);
  const [buildings,setBuildings]=useState<Building[]>([]);
  const [items,setItems]=useState<Assign[]>([]);
  const [loading,setLoading]=useState(true); const [err,setErr]=useState<string|null>(null);

  const [level,setLevel]=useState<"building"|"unit">("unit");
  const [refId,setRefId]=useState("");
  const [templateId,setTemplateId]=useState("");
  const [fields,setFields]=useState<Record<string,string>>({});

  const tpl = useMemo(()=> templates.find(t=>t.id===templateId) || null, [templates, templateId]);
  const previewAr = useMemo(()=> resolve(fields, tpl?.bodyAr||""), [tpl, fields]);
  const previewEn = useMemo(()=> resolve(fields, tpl?.bodyEn||""), [tpl, fields]);

  useEffect(()=>{ (async()=>{
    try{
      const [tr, ar, br] = await Promise.all([
        fetch("/api/contract-templates"),
        fetch("/api/contract-assignments"),
        fetch("/api/buildings")
      ]);
      const tjs = tr.ok? await tr.json():{items:[]};
      const ajs = ar.ok? await ar.json():{items:[]};
      const bjs = br.ok? await br.json():{items:[]};

      setTemplates(Array.isArray(tjs.items)?tjs.items:[]);
      setItems(Array.isArray(ajs.items)?ajs.items:[]);
      setBuildings(Array.isArray(bjs.items)?bjs.items:[]);
    }catch{ setErr("تعذّر جلب البيانات"); } finally{ setLoading(false); }
  })(); },[]);

  useEffect(()=>{ if(!tpl) return;
    setFields(prev=>{
      const next = { ...prev };
      for(const f of tpl.fields){ if(next[f.key]===undefined) next[f.key]=""; }
      Object.keys(next).forEach(k=>{ if(!tpl.fields.find(f=>f.key===k)) delete (next as any)[k]; });
      return next;
    });
  },[tpl?.id]);

  function onField(k:string,v:string){ setFields(s=>({ ...s, [k]: v })); }

  async function save(){
    if(!templateId) return alert("اختر قالبًا");
    if(!refId) return alert("اختر مرجعًا");
    const r = await fetch("/api/contract-assignments",{ method:"POST", headers:{ "content-type":"application/json" }, body: JSON.stringify({ level, refId, templateId, fieldsOverride: fields }) });
    const d = await r.json();
    if(r.ok){ setItems(x=>[...x, d.item]); alert("تم الحفظ"); } else alert(d?.error || "فشل الحفظ");
  }

  const unitOptions = useMemo(()=>{
    const rows: {id:string; label:string}[] = [];
    for (const b of buildings) {
      for (const u of b.units || []) {
        rows.push({ id: u.id, label: `مبنى ${b.buildingNo} — وحدة ${u.unitNo}` });
      }
    }
    return rows;
  },[buildings]);

  return (
    <div className="min-h-screen flex flex-col">
      <Head><title>تخصيصات العقود</title></Head>
      
      <main className="container mx-auto p-4 flex-1 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">تخصيصات العقود للوحدات/المباني</h1>
          <Link href="/admin/contracts/settings" className="btn">العقد الموحّد</Link>
        </div>

        {loading? <div>جارٍ التحميل…</div> : err? <div className="text-red-600">{err}</div> : (
          <div className="grid lg:grid-cols-3 gap-4">
            <section className="lg:col-span-2 border rounded-2xl p-3 space-y-3">
              <div className="grid sm:grid-cols-3 gap-2">
                <select className="form-input" value={level} onChange={e=>{ setLevel(e.target.value as any); setRefId(""); }}>
                  <option value="unit">لوحدة</option>
                  <option value="building">لمبنى</option>
                </select>

                {level==="unit" ? (
                  <select className="form-input" value={refId} onChange={e=>setRefId(e.target.value)}>
                    <option value="">اختر الوحدة</option>
                    {unitOptions.map(o=> <option key={o.id} value={o.id}>{o.label}</option>)}
                  </select>
                ) : (
                  <select className="form-input" value={refId} onChange={e=>setRefId(e.target.value)}>
                    <option value="">اختر المبنى</option>
                    {buildings.map(b=><option key={b.id} value={b.id}>مبنى {b.buildingNo} — {b.address}</option>)}
                  </select>
                )}

                <select className="form-input" value={templateId} onChange={e=>setTemplateId(e.target.value)}>
                  <option value="">اختر القالب</option>
                  {templates.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>

              {tpl && (
                <div className="space-y-2">
                  <div className="font-semibold">حقول هذا التعيين</div>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {tpl.fields.map(f=>(
                      <input key={f.key} className="form-input" placeholder={`${f.labelAr} / ${f.labelEn}`} value={fields[f.key]||""} onChange={e=>onField(f.key,e.target.value)} />
                    ))}
                  </div>
                </div>
              )}

              <button className="btn btn-primary" onClick={save}>حفظ التعيين</button>
            </section>

            <section className="border rounded-2xl p-3 space-y-2">
              <div className="font-semibold">معاينة سريعة</div>
              <div className="text-xs text-gray-500">العربي</div>
              <div className="border rounded p-2 text-sm whitespace-pre-wrap bg-gray-50">{previewAr}</div>
              <div className="text-xs text-gray-500">English</div>
              <div className="border rounded p-2 text-sm whitespace-pre-wrap bg-gray-50">{previewEn}</div>

              <div className="font-semibold mt-3">التعيينات الحالية</div>
              <div className="overflow-auto">
                <table className="w-full text-sm border">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="p-2 text-left">المستوى</th>
                      <th className="p-2 text-left">المرجع</th>
                      <th className="p-2 text-left">القالب</th>
                      <th className="p-2 text-left">آخر تحديث</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map(a=>(
                      <tr key={a.id} className="border-b">
                        <td className="p-2">{a.level==="unit"?"وحدة":"مبنى"}</td>
                        <td className="p-2">{a.refId}</td>
                        <td className="p-2">{a.templateId}</td>
                        <td className="p-2">{new Date(a.updatedAt).toLocaleString("ar", { calendar: "gregory", numberingSystem: "latn" },{year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit"})}</td>
                      </tr>
                    ))}
                    {items.length===0 && <tr><td className="p-3 text-center text-gray-600" colSpan={4}>لا توجد تخصيصات.</td></tr>}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}
      </main>
      
    </div>
  );
}
