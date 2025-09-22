// src/pages/admin/i18n/index.tsx
import { useEffect, useMemo, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import Head from "next/head";
import { useTranslation } from "@/hooks/useTranslation";
function I18nAdmin(){
  const { t, dir, lang } = useTranslation();
  const [missing,setMissing]=useState<any>({});
  const [over,setOver]=useState<Record<string,string>>({});
  const [curLang,setCurLang]=useState(lang||"ar");
  const [draft,setDraft]=useState<Record<string,string>>({});

  async function load(){
    const [m,o] = await Promise.all([
      fetch("/api/i18n/missing").then(r=>r.json()).catch(()=>({})),
      fetch(`/api/i18n/overrides?lang=${curLang}`).then(r=>r.json()).catch(()=>({entries:{}})),
    ]);
    setMissing(m||{}); setOver(o?.entries||{}); setDraft({});
  }
  useEffect(()=>{ load(); },[curLang]);

  const keysMissing = useMemo(()=> Object.keys(missing?.[curLang]||{}).sort(), [missing,curLang]);
  const keysOver = useMemo(()=> Object.keys(over||{}).sort(), [over]);

  async function saveNew(){
    if (!Object.keys(draft).length) return;
    await fetch("/api/i18n/overrides",{ method:"PUT", headers:{ "Content-Type":"application/json" }, body: JSON.stringify({ lang: curLang, entries: draft }) });
    await fetch("/api/i18n/missing",{ method:"DELETE" }); // يمكن لاحقًا مسح انتقائي
    await load();
  }
  async function removeKeys(keys:string[]){
    await fetch("/api/i18n/overrides",{ method:"DELETE", headers:{ "Content-Type":"application/json" }, body: JSON.stringify({ lang: curLang, keys }) });
    await load();
  }

  return (
    <AdminLayout>
      <Head><title>{t("i18n.title","إدارة الترجمات")} | Ain Oman</title></Head>
      <main dir={dir} className="mx-auto max-w-7xl px-4 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">إدارة الترجمات</h1>
          <select value={curLang} onChange={(e)=>setCurLang(e.target.value)} className="rounded-xl border p-2 text-sm">
            <option value="ar">العربية</option>
            <option value="en">English</option>
          </select>
        </div>

        {/* مفقودة */}
        <section className="rounded-2xl border bg-white p-4">
          <div className="mb-3 text-sm font-semibold">مفاتيح مفقودة</div>
          {keysMissing.length===0 ? <div className="text-sm text-slate-500">لا توجد مفاتيح مفقودة.</div> : (
            <div className="space-y-3">
              {keysMissing.map((k)=>(
                <div key={k} className="grid grid-cols-1 gap-2 md:grid-cols-3">
                  <div className="text-xs text-slate-500 break-all">{k}</div>
                  <input className="rounded border p-2 text-sm md:col-span-2" value={draft[k]||""} onChange={(e)=>setDraft({...draft,[k]:e.target.value})} placeholder="الترجمة هنا"/>
                </div>
              ))}
              <button onClick={saveNew} className="rounded-xl border px-3 py-1.5 text-sm hover:bg-slate-50">حفظ الترجمات الجديدة</button>
            </div>
          )}
        </section>

        {/* موجودة */}
        <section className="rounded-2xl border bg-white p-4">
          <div className="mb-3 text-sm font-semibold">ترجمات مخصّصة</div>
          {keysOver.length===0 ? <div className="text-sm text-slate-500">لا توجد.</div> : (
            <div className="space-y-2">
              {keysOver.map((k)=>(
                <div key={k} className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="truncate text-xs text-slate-500">{k}</div>
                    <div className="truncate text-sm">{over[k]}</div>
                  </div>
                  <button onClick={()=>removeKeys([k])} className="rounded border px-2 py-1 text-xs hover:bg-slate-50">حذف</button>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </AdminLayout>
  );
}
