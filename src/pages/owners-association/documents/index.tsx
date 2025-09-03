import React, { useEffect, useState } from "react";
import Head from "next/head"; import Link from "next/link";
import Layout from "@/components/layout/Layout"; import { useTSafe } from "@/lib/i18n-safe";
import HoaNav from "@/components/hoa/HoaNav"; import { DocumentStatus } from "@/components/common/DocumentStatus";
type Doc = { id: string; title: string; expiry?: string; url?: string };

export default function DocumentsHubPage() {
  const { t, dir } = useTSafe(); const [docs, setDocs] = useState<Doc[]>([]); const [file, setFile] = useState<File | null>(null);
  useEffect(() => { (async () => { try { const r = await fetch("/api/hoa/documents"); const js = await r.json(); setDocs(Array.isArray(js)?js:[]);} catch {} })(); }, []);
  const addDoc = () => { if (!file) return; const id="DOC-"+Math.random().toString(36).slice(2,6).toUpperCase(); setDocs(prev=>[{ id, title: file.name, expiry: new Date(Date.now()+86400000*30).toISOString().slice(0,10) },...prev]); setFile(null); };
  return (
    <Layout>
      <Head><title>{t("hoa.docs.title","المستندات")}</title></Head>
      <div dir={dir} className="space-y-6">
        <HoaNav />
        <h1 className="text-2xl font-semibold">{t("hoa.docs.title","المستندات")}</h1>
        <section className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4">
          <h2 className="font-medium mb-2">{t("hoa.docs.upload","رفع ملف")}</h2>
          <div className="flex items-center gap-2"><input type="file" onChange={e => setFile(e.target.files?.[0] || null)} /><button onClick={addDoc} className="px-3 py-2 rounded-xl bg-[var(--brand-700,#0f766e)] text-white">{t("add","إضافة")}</button></div>
          <div className="text-xs text-neutral-500 mt-2">{t("hint.upload","اربط لاحقاً بـ /api/property/upload أو نقطة نهاية مخصصة للجمعية.")}</div>
        </section>
        <section className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300"><tr><th className="text-start p-3">#</th><th className="text-start p-3">{t("title","العنوان")}</th><th className="text-start p-3">{t("status","الحالة")}</th></tr></thead>
            <tbody>{docs.map((d,i)=>(<tr key={d.id} className="border-t border-neutral-200 dark:border-neutral-800"><td className="p-3">{i+1}</td><td className="p-3">{d.title}</td><td className="p-3"><DocumentStatus expiry={d.expiry}/></td></tr>))}</tbody>
          </table>
        </section>
      </div>
    </Layout>
  );
}
