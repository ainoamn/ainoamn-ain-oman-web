// src/components/admin/settings/ManualDevTool.tsx
import { useEffect, useState } from "react";

type Section = { id: string; title: string; href: string; group?: string; useCentral?: boolean };
function ManualDevTool() {
  const [list, setList] = useState<Section[]>([]);
  const [form, setForm] = useState<Section>({ id: "", title: "", href: "", group: "custom", useCentral: true });
  const [saving, setSaving] = useState(false);

  async function load() {
    const r = await fetch("/api/admin/dev/sections"); const j = await r.json().catch(()=>({sections:[]}));
    setList(Array.isArray(j.sections)? j.sections: []);
  }
  useEffect(()=>{ load(); },[]);

  async function save(e: any) {
    e?.preventDefault?.();
    setSaving(true);
    await fetch("/api/admin/dev/sections", { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify(form) });
    setForm({ id:"", title:"", href:"", group:"custom", useCentral:true });
    await load(); setSaving(false);
  }
  async function remove(id: string) {
    await fetch(`/api/admin/dev/sections?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    await load();
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="mb-3 text-base font-semibold text-slate-900">أداة التطوير اليدوية</h3>

      <form onSubmit={save} className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <label className="flex flex-col gap-1">
          <span className="text-xs text-slate-600">المعرف (id)</span>
          <input value={form.id} onChange={(e)=>setForm({...form, id:e.target.value})} className="rounded-xl border p-2" placeholder="مثال: partners-2025" required/>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs text-slate-600">العنوان</span>
          <input value={form.title} onChange={(e)=>setForm({...form, title:e.target.value})} className="rounded-xl border p-2" placeholder="اسم في الشريط الجانبي" required/>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs text-slate-600">المجموعة</span>
          <input value={form.group||"custom"} onChange={(e)=>setForm({...form, group:e.target.value})} className="rounded-xl border p-2" placeholder="custom / العمليات / المحتوى ..."/>
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={!!form.useCentral} onChange={(e)=>setForm({...form, useCentral:e.target.checked})}/>
          <span className="text-sm text-slate-700">استخدام اللوحة المركزية ‎/admin/dashboard?section=id‎</span>
        </label>
        {!form.useCentral && (
          <label className="md:col-span-2 flex flex-col gap-1">
            <span className="text-xs text-slate-600">المسار اليدوي (href)</span>
            <input value={form.href} onChange={(e)=>setForm({...form, href:e.target.value})} className="rounded-xl border p-2" placeholder="/admin/your-page"/>
          </label>
        )}
        <div className="md:col-span-2">
          <button disabled={saving} className="rounded-xl border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-50">
            {saving? "جارٍ الحفظ…" : "حفظ/تحديث"}
          </button>
        </div>
      </form>

      <div className="mt-5">
        <h4 className="mb-2 text-sm font-semibold text-slate-900">القائمة الحالية</h4>
        <ul className="divide-y rounded-2xl border">
          {list.map((s)=>(
            <li key={s.id} className="flex items-center justify-between p-3 text-sm">
              <div className="space-y-0.5">
                <div className="font-medium text-slate-900">{s.title} <span className="ms-2 text-xs text-slate-500">id: {s.id}</span></div>
                <div className="text-xs text-slate-600">{s.useCentral ? `/admin/dashboard?section=${s.id}` : s.href} | group: {s.group||"custom"}</div>
              </div>
              <div className="flex items-center gap-2">
                <a href={s.useCentral ? `/admin/dashboard?section=${s.id}` : s.href} className="rounded-lg border px-2 py-1 text-xs hover:bg-slate-50">فتح</a>
                <button onClick={()=>remove(s.id)} className="rounded-lg border px-2 py-1 text-xs hover:bg-slate-50">حذف</button>
              </div>
            </li>
          ))}
          {list.length===0 && <li className="p-3 text-xs text-slate-500">لا توجد عناصر.</li>}
        </ul>
      </div>
    </section>
  );
}
