// src/pages/admin/contracts/settings.tsx
import Head from "next/head";
// Header is now handled by MainLayout in _app.tsx

import { useEffect, useMemo, useState } from "react";
import InstantLink from '@/components/InstantLink';

type Template = {
  id:string; name:string; scope:"unified"|"per-unit";
  bodyAr:string; bodyEn:string;
  fields:{ key:string; labelAr:string; labelEn:string; required?:boolean }[];
};
type Settings = { templateId:string; defaultFields:Record<string,string>; updatedAt:string };

function render(body:string, fields:Record<string,string>){
  let out = body || "";
  Object.entries(fields||{}).forEach(([k,v])=>{
    out = out.replace(new RegExp(`{{\\s*${k}\\s*}}`,"g"), String(v??""));
  });
  return out;
}

export default function ContractSettingsPage(){
  const [templates,setTemplates]=useState<Template[]>([]);
  const [settings,setSettings]=useState<Settings|null>(null);
  const [loading,setLoading]=useState(true);
  const [err,setErr]=useState<string|null>(null);

  const [templateId,setTemplateId]=useState("");
  const [fields,setFields]=useState<Record<string,string>>({});

  const tpl = useMemo(()=> templates.find(t=>t.id===templateId) || null, [templates, templateId]);
  const previewAr = useMemo(()=> render(tpl?.bodyAr||"", fields), [tpl, fields]);
  const previewEn = useMemo(()=> render(tpl?.bodyEn||"", fields), [tpl, fields]);

  useEffect(()=>{ (async()=>{
    try{
      // ÒÑÇÚÉ ÇáŞæÇáÈ ÊÊã ÊáŞÇÆíğÇ ÚäÏ Ãæá ØáÈ
      const [tr, sr] = await Promise.all([
        fetch("/api/contract-templates"),
        fetch("/api/contract-settings"),
      ]);
      const tjs = tr.ok? await tr.json() : { items: [] };
      const sjs = sr.ok? await sr.json() : { item: null };
      const tlist:Template[] = Array.isArray(tjs.items)? tjs.items : [];
      const s:Settings|null = sjs.item || null;
      setTemplates(tlist);
      if(s){
        setSettings(s);
        setTemplateId(s.templateId || (tlist[0]?.id || ""));
        setFields(s.defaultFields || {});
      } else {
        setTemplateId(tlist[0]?.id || "");
      }
    }catch{ setErr("ÊÚĞøÑ ÌáÈ ÇáÈíÇäÇÊ"); }
    finally{ setLoading(false); }
  })(); },[]);

  useEffect(()=>{
    // ÚäÏ ÊÛííÑ ÇáŞÇáÈ¡ ÃÚöÏ ÖÈØ ÇáÍŞæá ÇáÃÓÇÓíÉ Ïæä İŞÏ ÇáãÏÎáÇÊ ÇáãæÌæÏÉ
    if(!tpl) return;
    setFields(prev=>{
      const next = { ...prev };
      for(const f of tpl.fields){
        if (next[f.key] === undefined) next[f.key] = "";
      }
      // ÅÒÇáÉ ãİÇÊíÍ ÛíÑ ãæÌæÏÉ İí ÇáŞÇáÈ ÇáÍÇáí
      Object.keys(next).forEach(k=>{
        if(!tpl.fields.find(f=>f.key===k)) delete (next as any)[k];
      });
      return next;
    });
  },[tpl?.id]);

  function setField(k:string, v:string){ setFields(s=>({ ...s, [k]: v })); }

  async function save(){
    if(!templateId) return alert("ÇÎÊÑ ŞÇáÈğÇ");
    const r = await fetch("/api/contract-settings", {
      method:"PUT", headers:{ "content-type":"application/json" },
      body: JSON.stringify({ templateId, defaultFields: fields })
    });
    const d = await r.json();
    if(r.ok){ setSettings(d.item); alert("Êã ÇáÍİÙ"); } else alert(d?.error || "İÔá ÇáÍİÙ");
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Head><title>ÅÚÏÇÏ ÇáÚŞÏ ÇáãæÍøÏ</title></Head>
      
      <main className="container mx-auto p-4 flex-1 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">ÅÚÏÇÏ ÇáÚŞÏ ÇáãæÍøÏ</h1>
          <InstantLink href="/admin/contracts/overrides" className="btn">ÊÎÕíÕÇÊ ãÈÇäò/æÍÏÇÊ</InstantLink>
        </div>

        {loading? <div>ÌÇÑò ÇáÊÍãíá…</div> : err? <div className="text-red-600">{err}</div> : (
          <div className="grid lg:grid-cols-3 gap-4">
            <section className="lg:col-span-2 border rounded-2xl p-3 space-y-3">
              <div className="grid sm:grid-cols-2 gap-2">
                <select className="form-input" value={templateId} onChange={e=>setTemplateId(e.target.value)}>
                  <option value="">ÇÎÊÑ ŞÇáÈğÇ</option>
                  {templates.map(t=> <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
                <div className="text-sm text-gray-500 self-center">
                  {settings?.updatedAt ? `ÂÎÑ ÊÍÏíË: ${new Date(settings.updatedAt).toLocaleString("ar", { calendar: "gregory", numberingSystem: "latn" })}` : ""}
                </div>
              </div>

              {tpl ? (
                <div className="space-y-2">
                  <div className="font-semibold">ÇáÍŞæá ÇáÇİÊÑÇÖíÉ</div>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {tpl.fields.map(f=>(
                      <input key={f.key}
                        className="form-input"
                        placeholder={`${f.labelAr} / ${f.labelEn}`}
                        value={fields[f.key]||""}
                        onChange={e=>setField(f.key, e.target.value)} />
                    ))}
                  </div>
                </div>
              ) : <div className="text-sm text-gray-600">ÇÎÊÑ ŞÇáÈğÇ ááÈÏÁ.</div>}

              <button className="btn btn-primary" onClick={save}>ÍİÙ</button>
            </section>

            <section className="border rounded-2xl p-3 space-y-3">
              <div className="font-semibold">ãÚÇíäÉ ÇáŞÇáÈ</div>
              <div className="space-y-2">
                <div className="text-xs text-gray-500">ÇáäÕ ÇáÚÑÈí</div>
                <div className="border rounded p-2 text-sm whitespace-pre-wrap bg-gray-50">{previewAr}</div>
                <div className="text-xs text-gray-500">English Text</div>
                <div className="border rounded p-2 text-sm whitespace-pre-wrap bg-gray-50">{previewEn}</div>
              </div>
            </section>
          </div>
        )}
      </main>
      
    </div>
  );
}
