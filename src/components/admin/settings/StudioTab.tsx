// src/components/admin/settings/StudioTab.tsx  (استبدل بالمحتوى)
import Head from "next/head";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { ADMIN_MODULES, GROUP_LABELS, filterModulesByFlags, type AdminModule } from "@/lib/admin/registry";
import ModuleCard from "@/components/admin/ModuleCard";
import NewLinkDialog from "@/components/admin/NewLinkDialog";

type Section = { id:string; title:string; titleKey?:string; href:string; group?:string; useCentral?:boolean; _type:"builtin"|"custom" };
function StudioTab(){
  const { t, dir } = useTranslation();
  const [open,setOpen]=useState(false);
  const [flags,setFlags]=useState<Record<string,boolean>>({});
  const [extras,setExtras]=useState<any[]>([]);
  const [overrides,setOverrides]=useState<any[]>([]);
  const [order,setOrder]=useState<string[]>([]);
  const [loading,setLoading]=useState(true);

  useEffect(()=>{ fetch("/api/config/feature-flags").then(r=>r.json()).then(setFlags).catch(()=>{}); },[]);
  async function loadAll(){
    setLoading(true);
    const [s,ov] = await Promise.all([
      fetch("/api/admin/dev/sections").then(r=>r.json()).catch(()=>({sections:[]})),
      fetch("/api/admin/dev/overrides").then(r=>r.json()).catch(()=>({overrides:[],order:[]})),
    ]);
    setExtras(s.sections||[]); setOverrides(ov.overrides||[]); setOrder(ov.order||[]); setLoading(false);
  }
  useEffect(()=>{ loadAll(); },[]);

  const ovMap = useMemo(()=>new Map(overrides.map((o:any)=>[o.id,o])),[overrides]);

  const builtinEffective = useMemo(()=>{
    const list = filterModulesByFlags(ADMIN_MODULES as AdminModule[], flags)
      .map((m:any)=>{
        const o = ovMap.get(m.id);
        if(!o) return m;
        const href = typeof o.href==="string"? o.href : (o.useCentral? `/admin/dashboard?section=${m.id}` : m.href);
        return { ...m, title:o.title??m.title, titleKey:o.titleKey??m.titleKey, group:o.group??m.group, href, hidden:!!o.hidden };
      })
      .filter((m:any)=>!m.hidden);
    return list;
  },[flags,ovMap]);

  // دمج + ترتيب موحد
  const all: Section[] = useMemo(()=>{
    const custom: Section[] = (extras||[]).map((x:any)=>({ id:x.id, title:x.title, titleKey:x.titleKey, group:x.group||"custom", href: x.useCentral? `/admin/dashboard?section=${x.id}` : (x.href||`/admin/${x.id}`), useCentral:x.useCentral, _type:"custom" }));
    const builtins: Section[] = builtinEffective.map((m:any)=>({ id:m.id, title:m.title, titleKey:m.titleKey, group:m.group, href: m.id? `/admin/dashboard?section=${m.id}` : (m.href||"#"), useCentral:true, _type:"builtin" }));
    const merged = [...builtins, ...custom];
    const pos = new Map(order.map((id:string,i:number)=>[id,i]));
    merged.sort((a,b)=> (pos.has(a.id)?pos.get(a.id)!:1e9) - (pos.has(b.id)?pos.get(b.id)!:1e9) || a.title.localeCompare(b.title,"ar"));
    return merged;
  },[builtinEffective, extras, order]);

  async function saveOverride(id:string, patch:any){
    await fetch(`/api/admin/dev/overrides?id=${encodeURIComponent(id)}`, { method:"PUT", headers:{ "Content-Type":"application/json" }, body: JSON.stringify({ id, ...patch }) });
    await loadAll();
  }
  async function clearOverride(id:string){
    await fetch(`/api/admin/dev/overrides?id=${encodeURIComponent(id)}`, { method:"DELETE" });
    await loadAll();
  }
  async function saveCustom(s:any){
    await fetch(`/api/admin/dev/sections?id=${encodeURIComponent(s.id)}`, { method:"PUT", headers:{ "Content-Type":"application/json" }, body: JSON.stringify(s) });
    await loadAll();
  }
  async function deleteCustom(id:string){
    await fetch(`/api/admin/dev/sections?id=${encodeURIComponent(id)}`, { method:"DELETE" });
    await loadAll();
  }
  async function move(id:string, dirn:-1|1){
    const arr = all.slice(); const i = arr.findIndex(x=>x.id===id); if(i<0) return;
    const j = i + dirn; if(j<0||j>=arr.length) return;
    [arr[i],arr[j]] = [arr[j],arr[i]];
    await fetch("/api/admin/dev/overrides",{ method:"PATCH", headers:{ "Content-Type":"application/json" }, body: JSON.stringify({ order: arr.map(x=>x.id) }) });
    await loadAll();
  }

  const grouped = useMemo(()=>groupBy(all, (m:any)=>m.group||"other"),[all]);

  return (
    <section className="space-y-6">
      <Head><title>{t("admin.studio.title","الاستوديو")} | Ain Oman</title></Head>

      <div dir={dir} className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-900">{t("admin.studio.title","الاستوديو")}</h2>
        <button onClick={()=>setOpen(true)} className="rounded-xl border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-50">
          {t("admin.studio.newLink","رابط مخصص جديد")}
        </button>
      </div>

      {/* عرض الموديولات الافتراضية كبطاقات مرجعية */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {Object.entries(groupBy(builtinEffective,(m:any)=>m.group)).map(([group,mods])=>(
          <div key={group} className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="mb-3 text-xs font-semibold uppercase text-slate-500">{(GROUP_LABELS as any)[group]?.ar || group}</div>
            <div className="space-y-3">{mods.map((m:any)=><ModuleCard key={m.id} mod={m}/>)}</div>
          </div>
        ))}
      </div>

      {/* إدارة موحّدة: تعديل/حذف/ترتيب + ترجمة + إخفاء */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="mb-3 text-xs font-semibold uppercase text-slate-500">إدارة العناصر</div>
        {loading ? <div className="text-sm text-slate-500">جارٍ التحميل…</div> : (
          <ul className="divide-y">
            {all.map((s)=>(
              <Row key={`${s._type}-${s.id}`} s={s}
                   onSave={async(v)=> s._type==="builtin" ? saveOverride(s.id, v) : saveCustom({...s,...v})}
                   onDelete={async()=> s._type==="builtin" ? clearOverride(s.id) : deleteCustom(s.id)}
                   onMove={move}
                   t={t}
              />
            ))}
          </ul>
        )}
      </div>

      <NewLinkDialog open={open} onClose={()=>{ setOpen(false); loadAll(); }} onCreated={()=>loadAll()}/>
    </section>
  );
}

function Row({ s, onSave, onDelete, onMove, t }:{ s:Section, onSave:(v:any)=>Promise<void>, onDelete:()=>Promise<void>, onMove:(id:string,dirn:-1|1)=>Promise<void>, t:any }){
  const [v,setV]=useState<any>({ title:s.title, titleKey:s.titleKey||"", href:s.href, group:s.group||"", useCentral:s.useCentral??true, hidden:false });
  const [edit,setEdit]=useState(false);

  return (
    <li className="flex flex-col gap-2 py-3 md:flex-row md:items-center md:justify-between">
      {!edit ? (
        <>
          <div className="min-w-0">
            <div className="truncate text-sm font-medium text-slate-900">{s.titleKey? t(s.titleKey,s.title): s.title} <span className="ms-2 text-xs text-slate-500">{s._type}</span></div>
            <div className="truncate text-xs text-slate-500">{s.href} {s.group? `• ${s.group}`:""}</div>
          </div>
          <div className="flex items-center gap-2">
            <a href={s.href} className="rounded-lg border px-2 py-1 text-xs hover:bg-slate-50">فتح</a>
            <button onClick={()=>onMove(s.id,-1)} className="rounded-lg border px-2 py-1 text-xs hover:bg-slate-50">أعلى</button>
            <button onClick={()=>onMove(s.id,+1)} className="rounded-lg border px-2 py-1 text-xs hover:bg-slate-50">أسفل</button>
            <button onClick={()=>setEdit(true)} className="rounded-lg border px-2 py-1 text-xs hover:bg-slate-50">تعديل</button>
            <button onClick={onDelete} className="rounded-lg border px-2 py-1 text-xs hover:bg-slate-50 text-red-600">{s._type==="builtin"?"مسح التعديل":"حذف"}</button>
          </div>
        </>
      ) : (
        <form onSubmit={async(e)=>{e.preventDefault(); await onSave(v); setEdit(false);}} className="flex flex-col gap-2 rounded-xl border p-2 md:flex-row md:items-center">
          <span className="text-xs text-slate-500 w-20">{s.id}</span>
          <input className="w-40 rounded border p-1 text-xs" value={v.title}    onChange={e=>setV({...v,title:e.target.value})}    placeholder="العنوان"/>
          <input className="w-44 rounded border p-1 text-xs" value={v.titleKey} onChange={e=>setV({...v,titleKey:e.target.value})} placeholder="مفتاح ترجمة"/>
          <input className="w-56 rounded border p-1 text-xs" value={v.href}     onChange={e=>setV({...v,href:e.target.value})}     placeholder="/admin/..."/>
          <input className="w-32 rounded border p-1 text-xs" value={v.group}    onChange={e=>setV({...v,group:e.target.value})}    placeholder="group"/>
          {s._type==="builtin" && <label className="flex items-center gap-1 text-xs"><input type="checkbox" checked={!!v.useCentral} onChange={e=>setV({...v,useCentral:e.target.checked})}/> central</label>}
          {s._type==="builtin" && <label className="flex items-center gap-1 text-xs"><input type="checkbox" checked={!!v.hidden} onChange={e=>setV({...v,hidden:e.target.checked})}/> إخفاء</label>}
          <button className="rounded border px-2 py-1 text-xs">حفظ</button>
          <button type="button" onClick={()=>setEdit(false)} className="rounded border px-2 py-1 text-xs">إلغاء</button>
        </form>
      )}
    </li>
  );
}

function groupBy<T>(arr:T[], key:(x:any)=>string){ const m:Record<string,T[]>= {}; for(const it of (arr||[]) as any[]){ const k=key(it)||"other"; (m[k] ||= []).push(it);} return m; }
