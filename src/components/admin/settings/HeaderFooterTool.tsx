// src/components/admin/settings/HeaderFooterTool.tsx
import { useEffect, useState } from "react";
type HF = { logoUrl?: string; showTopBar?: boolean; showFooter?: boolean; footerHtml?: string };
function HeaderFooterTool(){
  const [v,setV] = useState<HF>({ showTopBar:true, showFooter:true });
  const [saving,setSaving]=useState(false);

  useEffect(()=>{ (async()=>{
    const r=await fetch("/api/admin/dev/header-footer"); const j=await r.json().catch(()=>({}));
    setV({ showTopBar:true, showFooter:true, ...j });
  })(); },[]);

  async function save(e:any){ e?.preventDefault?.(); setSaving(true);
    await fetch("/api/admin/dev/header-footer",{ method:"PUT", headers:{ "Content-Type":"application/json" }, body:JSON.stringify(v) });
    setSaving(false);
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="mb-3 text-base font-semibold text-slate-900">أداة التحكم بالهيدر والفوتر</h3>
      <form onSubmit={save} className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <label className="flex items-center gap-2"><input type="checkbox" checked={!!v.showTopBar} onChange={(e)=>setV({...v, showTopBar:e.target.checked})}/> <span>إظهار الشريط العلوي</span></label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={!!v.showFooter} onChange={(e)=>setV({...v, showFooter:e.target.checked})}/> <span>إظهار الفوتر</span></label>
        <label className="md:col-span-2 flex flex-col gap-1">
          <span className="text-xs text-slate-600">رابط الشعار</span>
          <input className="rounded-xl border p-2" value={v.logoUrl||""} onChange={(e)=>setV({...v, logoUrl:e.target.value})} placeholder="https://…/logo.svg"/>
        </label>
        <label className="md:col-span-2 flex flex-col gap-1">
          <span className="text-xs text-slate-600">HTML الفوتر</span>
          <textarea rows={5} className="rounded-xl border p-2 font-mono" value={v.footerHtml||""} onChange={(e)=>setV({...v, footerHtml:e.target.value})} placeholder="<p>حقوق Ain Oman…</p>"/>
        </label>
        <div className="md:col-span-2">
          <button disabled={saving} className="rounded-xl border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-50">{saving?"جارٍ الحفظ…":"حفظ"}</button>
        </div>
      </form>
      <p className="mt-2 text-xs text-slate-500">ملاحظة: قم بقراءة هذا الإعداد داخل مكوّن ‎Header/Footer‎ لتطبيقه فعليًا.</p>
    </section>
  );
}
