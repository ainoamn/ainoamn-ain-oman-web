import React, { useEffect, useState } from "react";
import Head from "next/head"; import InstantLink from '@/components/InstantLink';
 import { useTSafe } from "@/lib/i18n-safe";
import HoaNav from "@/components/hoa/HoaNav";
type Item = { id: string; message: string; createdAt: string; read?: boolean };

export default function NotificationsPage() {
  const { t, dir } = useTSafe(); const [items, setItems] = useState<Item[]>([]); const [loading, setLoading] = useState(true);
  useEffect(() => { let m=true;(async()=>{ try{ const r=await fetch("/api/hoa/notifications"); const js=await r.json(); if(m && js && js.items) setItems(js.items);}catch{ if(m) setItems([]);}finally{ if(m) setLoading(false);} })(); return ()=>{m=false}; }, []);
  return (
    <>
      <Head><title>{t("hoa.notifications.title","الإشعارات")}</title></Head>
      <div dir={dir} className="space-y-6">
        <HoaNav />
        <h1 className="text-2xl font-semibold">{t("hoa.notifications.title","الإشعارات")}</h1>
        <section className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 divide-y divide-neutral-200 dark:divide-neutral-800">
          {loading && <div className="p-4 text-neutral-500">{t("loading","جاري التحميل…")}</div>}
          {!loading && items.length===0 && <div className="p-4 text-neutral-500">{t("empty","لا يوجد إشعارات")}</div>}
          {items.map(it => (<div key={it.id} className="p-4 flex items-center justify-between">
            <div><div className="font-medium">{it.message}</div><div className="text-xs text-neutral-500">{it.createdAt}</div></div>
            <InstantLink href="/owners-association/alerts" className="text-sm underline">{t("hoa.notifications.view","تفاصيل")}</InstantLink></div>))}
        </section>
      </div>
    </>
  );
}
