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
      // ����� ������� ��� �������� ��� ��� ���
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
    }catch{ setErr("����� ��� ��������"); }
    finally{ setLoading(false); }
  })(); },[]);

  useEffect(()=>{
    // ��� ����� �����ȡ ���� ��� ������ �������� ��� ��� �������� ��������
    if(!tpl) return;
    setFields(prev=>{
      const next = { ...prev };
      for(const f of tpl.fields){
        if (next[f.key] === undefined) next[f.key] = "";
      }
      // ����� ������ ��� ������ �� ������ ������
      Object.keys(next).forEach(k=>{
        if(!tpl.fields.find(f=>f.key===k)) delete (next as any)[k];
      });
      return next;
    });
  },[tpl?.id]);

  function setField(k:string, v:string){ setFields(s=>({ ...s, [k]: v })); }

  async function save(){
    if(!templateId) return alert("���� ������");
    const r = await fetch("/api/contract-settings", {
      method:"PUT", headers:{ "content-type":"application/json" },
      body: JSON.stringify({ templateId, defaultFields: fields })
    });
    const d = await r.json();
    if(r.ok){ setSettings(d.item); alert("�� �����"); } else alert(d?.error || "��� �����");
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Head><title>����� ����� �������</title></Head>
      
      <main className="container mx-auto p-4 flex-1 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">����� ����� �������</h1>
          <InstantLink href="/admin/contracts/overrides" className="btn">������� �����/�����</InstantLink>
        </div>

        {loading? <div>���� �������</div> : err? <div className="text-red-600">{err}</div> : (
          <div className="grid lg:grid-cols-3 gap-4">
            <section className="lg:col-span-2 border rounded-2xl p-3 space-y-3">
              <div className="grid sm:grid-cols-2 gap-2">
                <select className="form-input" value={templateId} onChange={e=>setTemplateId(e.target.value)}>
                  <option value="">���� ������</option>
                  {templates.map(t=> <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
                <div className="text-sm text-gray-500 self-center">
                  {settings?.updatedAt ? `��� �����: ${new Date(settings.updatedAt).toLocaleString("ar", { calendar: "gregory", numberingSystem: "latn" })}` : ""}
                </div>
              </div>

              {tpl ? (
                <div className="space-y-2">
                  <div className="font-semibold">������ ����������</div>
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
              ) : <div className="text-sm text-gray-600">���� ������ �����.</div>}

              <button className="btn btn-primary" onClick={save}>���</button>
            </section>

            <section className="border rounded-2xl p-3 space-y-3">
              <div className="font-semibold">������ ������</div>
              <div className="space-y-2">
                <div className="text-xs text-gray-500">���� ������</div>
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
