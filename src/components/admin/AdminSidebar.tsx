// src/components/admin/AdminSidebar.tsx  (استبدل بالمحتوى أدناه إن لم تكن قد دمجت سابقًا)
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { ADMIN_MODULES, GROUP_LABELS } from "@/lib/admin/registry";
import { useTranslation } from "@/hooks/useTranslation";

type CustomSection = { id:string; title:string; href?:string; group?:string; useCentral?:boolean };
type Override = { id:string; title?:string; titleKey?:string; href?:string; group?:string; hidden?:boolean; useCentral?:boolean };

export default function AdminSidebar(){
  const { t, dir } = useTranslation();
  const r = useRouter();
  const [open,setOpen]=useState(true);
  const [extras,setExtras]=useState<CustomSection[]>([]);
  const [overrides,setOverrides]=useState<Override[]>([]);
  const [order,setOrder]=useState<string[]>([]);

  useEffect(()=>{ fetch("/api/admin/dev/sections").then(r=>r.json()).then(j=>setExtras(j.sections||[])).catch(()=>setExtras([])); },[]);
  useEffect(()=>{ fetch("/api/admin/dev/overrides").then(r=>r.json()).then(j=>{setOverrides(j.overrides||[]); setOrder(j.order||[]);}).catch(()=>{}); },[]);

  const ovMap = useMemo(()=> new Map(overrides.map(o=>[o.id,o])), [overrides]);

  const builtins = useMemo(()=>{
    const list = ADMIN_MODULES.map((m:any)=>{
      const o = ovMap.get(m.id);
      if(!o) return m;
      const href = typeof o.href==="string" ? o.href : (o.useCentral? `/admin/dashboard?section=${m.id}` : m.href);
      return { ...m,
        title: o.title ?? m.title,
        titleKey: o.titleKey ?? m.titleKey,
        group: o.group ?? m.group,
        href,
        hidden: !!o.hidden
      };
    }).filter((m:any)=>!m.hidden);
    return list;
  }, [ovMap]);

  // دمج الجميع + ترتيب موحّد
  const all = useMemo(()=>{
    const custom = (extras||[]).map((x:any)=>({
      id:x.id, title:x.title, titleKey:x.titleKey, group:x.group||"custom",
      href: x.useCentral? `/admin/dashboard?section=${x.id}` : (x.href||`/admin/${x.id}`), _type:"custom"
    }));
    const builtin = builtins.map((m:any)=>({ id:m.id, title:m.title, titleKey:m.titleKey, group:m.group, href: m.id? `/admin/dashboard?section=${m.id}` : (m.href||"#"), _type:"builtin" }));
    const merged = [...builtin, ...custom];
    const idx = new Map(order.map((id,i)=>[id,i]));
    merged.sort((a,b)=>{
      const ia = idx.has(a.id)? idx.get(a.id)! : 1e9;
      const ib = idx.has(b.id)? idx.get(b.id)! : 1e9;
      return ia - ib || String(a.title).localeCompare(String(b.title),"ar");
    });
    return merged;
  }, [builtins, extras, order]);

  const grouped = useMemo(()=>groupBy(all,(m:any)=>m.group||"other"),[all]);

  const active = (href:string)=>{
    if (!href) return false;
    if (href.startsWith("/admin/dashboard?section=")) {
      const sec = href.split("section=")[1];
      return r.pathname==="/admin/dashboard" && r.query?.section===sec;
    }
    return r.asPath===href || r.asPath.startsWith(href+"/");
  };

  return (
    <aside dir={dir} className={`border-slate-200 bg-white ${open?"w-72":"w-16"} shrink-0 border-e transition-all`}>
      <div className="flex items-center justify-between p-3">
        <Link href="/admin/dashboard" className="text-sm font-semibold">Ain Oman Admin</Link>
        <button onClick={()=>setOpen(v=>!v)} className="rounded p-2 text-slate-600 hover:bg-slate-100">{open?"«":"»"}</button>
      </div>

      <nav className="px-2 pb-6">
        {Object.entries(grouped).map(([group,mods])=>(
          <div key={group} className="mb-4">
            {open && <div className="px-2 pb-1 text-xs font-semibold uppercase text-slate-400">{(GROUP_LABELS as any)[group]?.ar || group}</div>}
            <ul className="space-y-1">
              {mods.map((m:any)=>(
                <li key={`${m._type}-${m.id}`}>
                  <Link href={m.href}
                    className={`block rounded-xl px-3 py-2 text-sm border-s-2 ${active(m.href)? "bg-[var(--brand-50,#f0fbfd)] text-[var(--brand-800,#0b8a98)] border-[var(--brand-700,#0ea5b7)]" : "text-slate-700 hover:bg-slate-50 border-transparent"}`}
                    title={m.titleKey? t(m.titleKey,m.title): m.title}
                  >
                    {open ? (m.titleKey? t(m.titleKey,m.title): m.title) : (m.title||"•").charAt(0)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div className="mt-6 border-t pt-3">
          <ul className="space-y-1">
            <li><Link href="/admin/studio" className={`block rounded-xl px-3 py-2 text-sm ${active("/admin/studio")? "bg-[var(--brand-50,#f0fbfd)] text-[var(--brand-800,#0b8a98)]":"text-slate-700 hover:bg-slate-50"}`}>الاستوديو</Link></li>
            <li><Link href="/admin/settings" className={`block rounded-xl px-3 py-2 text-sm ${active("/admin/settings")? "bg-[var(--brand-50,#f0fbfd)] text-[var(--brand-800,#0b8a98)]":"text-slate-700 hover:bg-slate-50"}`}>الإعدادات</Link></li>
          </ul>
        </div>
      </nav>
    </aside>
  );
}
function groupBy<T>(arr:T[], key:(x:any)=>string){ const m:Record<string,T[]>= {}; for(const it of (arr||[]) as any[]){ const k=key(it)||"other"; (m[k] ||= []).push(it);} return m; }
