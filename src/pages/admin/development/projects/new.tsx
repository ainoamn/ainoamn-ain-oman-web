/**
 * /admin/development/projects/new — إضافة مشروع (Baseline Restored From Docs)
 */
import React, { useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Layout from "@/components/layout/Layout";


// Helpers (inline, non-invasive)
type JsonLike = any;
const toArray = (x: any) => (Array.isArray(x) ? x : (x && Array.isArray(x.items) ? x.items : (x && Array.isArray(x.data) ? x.data : [])));
async function safeJson(url: string, fallback: any) {
  try {
    const r = await fetch(url, { cache: "no-store" as any });
    if (!r.ok) return fallback;
    return await r.json();
  } catch { return fallback; }
}
function cls(...xs: (string|false|undefined|null)[]) { return xs.filter(Boolean).join(" "); }
function AdminNewProjectPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [city, setCity] = useState("");
  const [status, setStatus] = useState<"planned"|"selling"|"delivered">("planned");
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!title.trim()) return alert("أدخل عنوان المشروع");
    setSaving(true);
    const id = `PR-${Date.now()}`;
    try {
      const r = await fetch(`/api/development/projects/${encodeURIComponent(id)}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, title, city, status })
      });
      if (!r.ok) throw new Error("fail");
      router.push(`/development/projects/${encodeURIComponent(id)}`);
    } catch {
      router.push(`/development/projects/${encodeURIComponent(id)}`);
    } finally { setSaving(false); }
  };

  return (
    <Layout>
      <Head><title>مشروع جديد</title></Head>
      <div className="container mx-auto px-4 py-6 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-bold">مشروع جديد</h1>
          <a href="/admin/development/projects" className="px-3 py-2 rounded-lg border">رجوع</a>
        </div>

        <div className="rounded-2xl border p-4 bg-white dark:bg-neutral-900 grid md:grid-cols-2 gap-4">
          <label className="block">
            <div className="text-sm mb-1">العنوان</div>
            <input className="border rounded-lg px-3 py-2 w-full" value={title} onChange={(e)=>setTitle(e.target.value)} />
          </label>
          <label className="block">
            <div className="text-sm mb-1">المدينة</div>
            <input className="border rounded-lg px-3 py-2 w-full" value={city} onChange={(e)=>setCity(e.target.value)} />
          </label>
          <label className="block">
            <div className="text-sm mb-1">الحالة</div>
            <select className="border rounded-lg px-3 py-2 w-full" value={status} onChange={(e)=>setStatus(e.target.value as any)}>
              <option value="planned">مخطط</option>
              <option value="selling">للبيع</option>
              <option value="delivered">مُسلّم</option>
            </select>
          </label>
        </div>

        <div className="flex gap-3">
          <button onClick={submit} disabled={saving} className="px-5 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white disabled:opacity-60">{saving?"جارٍ الحفظ…":"حفظ وإنشاء"}</button>
          <button onClick={()=>{ setTitle(""); setCity(""); setStatus("planned"); }} className="px-5 py-3 rounded-xl border">إعادة تعيين</button>
        </div>
      </div>
    </Layout>
  );
}
