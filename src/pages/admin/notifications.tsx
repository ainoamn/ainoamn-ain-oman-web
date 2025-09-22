// FILE: src/pages/admin/notifications.tsx
import Head from "next/head";
import Layout from "@/components/layout/Layout";
import { useEffect, useState } from "react";

type OutboxItem = {
  id: string; at: string; channel: "email"|"whatsapp"|"sms"|"push";
  to: string; subject?: string; text: string; taskId?: string;
};
function NotificationsAdminPage() {
  const [items, setItems] = useState<OutboxItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const r = await fetch("/api/notify/outbox");
    const j = await r.json();
    setItems(Array.isArray(j?.items) ? j.items : []);
    setLoading(false);
  };
  useEffect(()=>{ load(); },[]);

  return (
    <>
      <Head><title>لوحة الإشعارات (Outbox)</title></Head>
      <Layout>
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">لوحة الإشعارات</h1>
            <button className="px-3 py-2 rounded-lg border hover:bg-gray-50" onClick={load}>تحديث</button>
          </div>
          {loading ? (
            <div className="p-6 border rounded-lg animate-pulse">يتم التحميل…</div>
          ) : (
            <div className="space-y-3">
              {items.map(it => (
                <div key={it.id} className="p-4 border rounded-lg">
                  <div className="text-xs text-gray-500 mb-1">{new Date(it.at).toLocaleString()} • {it.channel.toUpperCase()} • {it.to}</div>
                  {it.taskId && <div className="text-xs mb-1">مهمة: <a className="underline" href={`/admin/tasks/${it.taskId}`}>{it.taskId}</a></div>}
                  {it.subject && <div className="font-semibold">{it.subject}</div>}
                  <div className="whitespace-pre-wrap">{it.text}</div>
                </div>
              ))}
              {items.length===0 && <div className="p-6 border rounded-lg text-center text-gray-500">لا يوجد سجل إرسال بعد.</div>}
            </div>
          )}
        </div>
      </Layout>
    </>
  );
}
