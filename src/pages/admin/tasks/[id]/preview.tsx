// FILE: src/pages/admin/tasks/[id]/preview.tsx
import Head from "next/head";
import Layout from "@/components/layout/Layout";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

type Task = {
  id: string; serial?: string; title: string; description?: string;
  status: "open" | "in_progress" | "blocked" | "done" | "canceled";
  priority: "low"|"medium"|"high"|"urgent";
  assignees?: string[]; watchers?: string[]; labels?: string[]; category?: string;
  createdAt: string; updatedAt?: string; dueDate?: string; startDate?: string;
};

export default function TaskPreviewPage() {
  const router = useRouter();
  const tid = Array.isArray(router.query.id) ? router.query.id[0] : router.query.id;
  const [t, setT] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(()=> {
    if (!router.isReady || !tid) return;
    (async()=>{
      const r = await fetch(`/api/tasks/${encodeURIComponent(String(tid))}`);
      const j = await r.json();
      setT(j?.item || null);
      setLoading(false);
    })();
  }, [router.isReady, tid]);

  return (
    <>
      <Head><title>معاينة المهمة</title></Head>
      <Layout>
        <div className="container mx-auto px-4 py-6">
          {loading ? (
            <div className="p-6 border rounded-lg animate-pulse">يتم التحميل…</div>
          ) : !t ? (
            <div className="p-6 border rounded-lg">المهمة غير موجودة.</div>
          ) : (
            <div className="prose max-w-none">
              <h1 className="text-2xl font-bold mb-2">{t.title}</h1>
              <div className="text-sm text-gray-500 mb-4">رقم: {t.serial || t.id}</div>
              <div className="whitespace-pre-wrap mb-6">{t.description || "—"}</div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div className="p-3 border rounded-lg"><div className="text-gray-500 mb-1">الحالة</div><div>{t.status}</div></div>
                <div className="p-3 border rounded-lg"><div className="text-gray-500 mb-1">الأولوية</div><div>{t.priority}</div></div>
                <div className="p-3 border rounded-lg"><div className="text-gray-500 mb-1">المكلّفون</div><div>{(t.assignees||[]).join(", ")||"—"}</div></div>
                <div className="p-3 border rounded-lg"><div className="text-gray-500 mb-1">المراقبون</div><div>{(t.watchers||[]).join(", ")||"—"}</div></div>
              </div>
            </div>
          )}
        </div>
      </Layout>
    </>
  );
}
