// src/pages/admin/tasks/index.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Layout from "@/components/layout/Layout";

type Task = {
  id: string; title: string;
  status?: string; type?: string;
  assignee?: string | null; dueDate?: string | null; description?: string;
  propertyId?: string; bookingId?: string | null;
  createdAt?: string; updatedAt?: string;
  [k: string]: any;
};

function toArray(x: any): any[] {
  if (Array.isArray(x)) return x;
  if (Array.isArray(x?.items)) return x.items;
  if (Array.isArray(x?.data)) return x.data;
  return [];
}

const STATUS_OPTIONS = [
  { key: "", label: "كل الحالات" },
  { key: "open", label: "مفتوحة" },
  { key: "in_progress", label: "قيد التنفيذ" },
  { key: "done", label: "منجزة" },
  { key: "cancelled", label: "ملغاة" },
];

function Badge({ v }: { v?: string }) {
  const statusLabels: Record<string, string> = {
    open: "مفتوحة",
    in_progress: "قيد التنفيذ", 
    done: "منجزة",
    cancelled: "ملغاة",
    archived: "مؤرشفة"
  };
  
  const colorMap: Record<string, string> = {
    open: "bg-amber-50 text-amber-700 border-amber-200",
    in_progress: "bg-blue-50 text-blue-700 border-blue-200",
    done: "bg-emerald-50 text-emerald-700 border-emerald-200",
    cancelled: "bg-rose-50 text-rose-700 border-rose-200",
    archived: "bg-gray-50 text-gray-700 border-gray-200",
  };
  
  const label = statusLabels[v || ""] || v || "-";
  const cls = colorMap[v || ""] || "bg-slate-50 text-slate-700 border-slate-200";
  return <span className={`inline-block px-2 py-0.5 rounded-lg text-xs border ${cls}`}>{label}</span>;
}

export default function TasksIndexPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [propertyId, setPropertyId] = useState<string>("");

  const [taskId, setTaskId] = useState("");
  const [items, setItems] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string>("");

  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [sort, setSort] = useState<"updatedAt"|"createdAt">("updatedAt");

  useEffect(() => {
    if (!router.isReady) return;
    setPropertyId(typeof router.query.propertyId === "string" ? router.query.propertyId : "");
    setReady(true);
  }, [router.isReady, router.query.propertyId]);

  async function load(pid: string) {
    console.log("Admin tasks loading all tasks from unified API");
    setLoading(true);
    setErr("");
    try {
      // استخدام API المبسط مع فلترة اختيارية حسب propertyId
      const url = pid ? `/api/tasks/simple?propertyId=${encodeURIComponent(pid)}` : "/api/tasks/simple";
      const response = await fetch(url, {
        cache: "no-store",
        credentials: "include"
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log("Admin tasks loaded:", data.tasks?.length || 0, "tasks", pid ? `(propertyId=${pid})` : "");
        setItems(Array.isArray(data.tasks) ? data.tasks : []);
      } else {
        console.error("Failed to fetch tasks:", response.status);
        setErr("فشل في جلب البيانات");
        setItems([]);
      }
    } catch (e: any) {
      console.error("Admin tasks load error:", e);
      setErr(e?.message || "fetch failed");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { if (ready) load(propertyId); }, [ready, propertyId]);

  // تزامن تلقائي بعد تحديث أي مهمة في صفحة التفاصيل
  useEffect(() => {
    if (!ready) return;

    function onVisible() {
      if (document.visibilityState === "visible") load("");
    }
    document.addEventListener("visibilitychange", onVisible);

    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel("ao_tasks");
      bc.onmessage = (ev) => {
        if (ev?.data?.type === "updated") {
          console.log("Admin tasks received broadcast:", ev.data);
          // إعادة تحميل البيانات عند أي تحديث مع تأخير صغير لضمان تحديث البيانات
          setTimeout(() => {
            console.log("Admin tasks reloading after broadcast");
            load(propertyId);
          }, 100);
        }
      };
    } catch {}

    function onStorage(ev: StorageEvent) {
      if (ev.key === "ao_tasks_bump") load("");
    }
    window.addEventListener("storage", onStorage);

    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("storage", onStorage);
      try { bc?.close(); } catch {}
    };
  }, [ready, propertyId]);

  const filtered = useMemo(() => {
    const text = q.trim().toLowerCase();
    let out = items;
    if (status) out = out.filter(t => (t.status || "") === status);
    if (text) {
      out = out.filter(t =>
        String(t.id).toLowerCase().includes(text) ||
        String(t.title || "").toLowerCase().includes(text) ||
        String(t.propertyId || "").toLowerCase().includes(text) ||
        String(t.assignee || "").toLowerCase().includes(text)
      );
    }
    out = [...out].sort((a,b) =>
      String(b[sort] || "").localeCompare(String(a[sort] || ""))
    );
    return out;
  }, [items, q, status, sort]);

  const rows = useMemo(() => filtered.map((t) => (
    <tr key={t.id} className="border-t">
      <td className="p-3 font-mono">{t.id}</td>
      <td className="p-3">
        {t.title}
        {t.bookingId && <span className="ml-2 text-xs text-blue-600">(حجز: {t.bookingId})</span>}
      </td>
      <td className="p-3">{t.type || "-"}</td>
      <td className="p-3">{t.assignee || "-"}</td>
      <td className="p-3">{t.dueDate || "-"}</td>
      <td className="p-3"><Badge v={t.status} /></td>
      <td className="p-3">
        <button
          className="px-3 py-1 rounded border"
          onClick={() => router.push(`/admin/tasks/${encodeURIComponent(t.id)}`)}
        >
          فتح
        </button>
      </td>
    </tr>
  )), [filtered, router]);

  const handleOpenTask = () => {
    if (taskId.trim()) router.push(`/admin/tasks/${encodeURIComponent(taskId.trim())}`);
  };
  const handleKeyPress = (e: React.KeyboardEvent) => { if (e.key === "Enter") handleOpenTask(); };

  if (!ready) {
    return (
      <Layout>
        <Head><title>لوحة إدارة المهام | Ain Oman</title></Head>
        <div className="max-w-6xl mx-auto px-4 py-8" dir="rtl">جار التحميل…</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Head><title>لوحة إدارة المهام | Ain Oman</title></Head>

      <div className="max-w-6xl mx-auto px-4 py-8" dir="rtl">
        <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
          {/* العنوان الأصلي */}
          <div className="text-center mb-8">
            <h1 className="text-٢xl md:text-3xl font-bold text-slate-900 mb-2">لوحة إدارة المهام</h1>
            <p className="text-slate-600">افتح مهمة موجودة أو ابدأ مهمة جديدة عبر إدخال المعرف</p>
          </div>

          {/* الشريط الأصلي لفتح مهمة */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="flex-1 relative">
              <input
                className="w-full border border-slate-300 rounded-xl px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="أدخل معرّف المهمة (مثال: AO-T-000002)"
                value={taskId}
                onChange={(e) => setTaskId(e.target.value)}
                onKeyPress={handleKeyPress}
              />
              <svg className="w-5 h-5 absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <button
              className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              disabled={!taskId.trim()}
              onClick={handleOpenTask}
            >
              فتح المهمة
            </button>
          </div>

          {/* بطاقات التلميحات تبقى كما هي */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-center mb-2">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <h3 className="font-semibold text-slate-900 mr-2">مهمة جديدة</h3>
              </div>
              <p className="text-sm text-slate-600">ابدأ مهمة جديدة بإدخال معرّف فريد</p>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <div className="flex items-center mb-2">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 className="font-semibold text-slate-900 mr-2">إدارة المهام</h3>
              </div>
              <p className="text-sm text-slate-600">عرض وتعديل تفاصيل المهام الحالية</p>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
              <div className="flex items-center mb-2">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
                <h3 className="font-semibold text-slate-900 mr-2">مزامنة المهام</h3>
              </div>
              <p className="text-sm text-slate-600 mb-3">مزامنة المهام بين النظام الأساسي والمتقدم</p>
              <button
                onClick={() => router.push("/admin/tasks/sync")}
                className="w-full px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg transition-colors"
              >
                فتح صفحة المزامنة
              </button>
            </div>
          </div>
        </div>

        {/* شريط الأدوات والجدول الأصليان */}
        <div className="mt-6 mb-2 flex flex-col md:flex-row gap-3 items-start md:items-center justify-between">
          <div className="flex gap-2">
            <input className="border rounded-xl px-3 py-2 w-64" placeholder="بحث: العنوان/المعرف/العقار/المحال إليه" value={q} onChange={(e) => setQ(e.target.value)} />
            <select className="border rounded-xl px-3 py-2" value={status} onChange={(e) => setStatus(e.target.value)}>
              {STATUS_OPTIONS.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
            </select>
            <select className="border rounded-xl px-3 py-2" value={sort} onChange={(e) => setSort(e.target.value as any)}>
              <option value="updatedAt">الأحدث تعديلًا</option>
              <option value="createdAt">الأحدث إنشاءً</option>
            </select>
          </div>
          <div className="text-sm text-slate-500">المعروض: {filtered.length} / الإجمالي: {items.length}</div>
        </div>

        <div className="bg-white rounded-٢xl shadow-sm p-6">
          <div className="overflow-x-auto rounded-xl border">
            <table className="w-full text-right">
              <thead>
                <tr className="text-right text-sm text-slate-500">
                  <th className="p-3">ID</th>
                  <th className="p-3">العنوان</th>
                  <th className="p-3">النوع</th>
                  <th className="p-3">المحال إليه</th>
                  <th className="p-3">الاستحقاق</th>
                  <th className="p-3">الحالة</th>
                  <th className="p-3">إجراءات</th>
                </tr>
              </thead>
              <tbody>{rows}</tbody>
              {!loading && filtered.length === 0 && (
                <tbody><tr><td className="p-3 text-slate-500" colSpan={7}>لا توجد مهام.</td></tr></tbody>
              )}
            </table>
            {loading && <div className="p-4">جار التحميل…</div>}
            {err && <div className="p-3 text-sm text-red-600">خطأ: {err}</div>}
          </div>
        </div>
      </div>
    </Layout>
  );
}
