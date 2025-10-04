import Head from "next/head";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useI18n } from "@/lib/i18n";
import React from "react";
import { useMemo, useState, useEffect } from "react";

type Task = { 
  id: string; 
  title: string; 
  status: "open" | "in_progress" | "done" | "cancelled" | "archived"; 
  assignee?: string; 
  due?: string; 
  dueDate?: string;
  propertyId?: string;
  priority?: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
};

export function Content() {
  const [filter, setFilter] = useState("all");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("Fetching tasks from unified API...");
      
      // استخدام API المبسط
      const response = await fetch("/api/tasks/simple", {
        cache: "no-store",
        credentials: "include"
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log("Received tasks:", data.tasks?.length || 0);
        setTasks(Array.isArray(data.tasks) ? data.tasks : []);
      } else {
        console.error("Failed to fetch tasks:", response.status);
        setError("فشل في جلب البيانات");
      }
    } catch (e) {
      console.error("Error fetching tasks:", e);
      setError("خطأ في الاتصال");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();

    // الاستماع لتحديثات المهام
    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel("ao_tasks");
      bc.onmessage = (ev) => {
        if (ev?.data?.type === "updated") {
          console.log("Received task update broadcast:", ev.data);
          // إعادة تحميل البيانات مع تأخير صغير
          setTimeout(() => {
            console.log("Reloading tasks after broadcast");
            fetchTasks();
          }, 100);
        }
      };
    } catch (error) {
      console.error("BroadcastChannel error:", error);
    }

    function onStorage(ev: StorageEvent) {
      if (ev.key === "ao_tasks_bump") {
        console.log("Storage event triggered reload");
        fetchTasks();
      }
    }
    window.addEventListener("storage", onStorage);

    return () => {
      window.removeEventListener("storage", onStorage);
      try { bc?.close(); } catch {}
    };
  }, []);

  const list = useMemo(()=>tasks.filter(t=> filter==="all"?true:t.status===filter),[filter, tasks]);
  return (
    <section className="py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-slate-900">المهام</h1>
          <select value={filter} onChange={e=>setFilter(e.target.value)} className="rounded-xl border px-3 py-2 text-sm">
            <option value="all">الكل</option><option value="open">مفتوحة</option><option value="in_progress">قيد التنفيذ</option><option value="done">منجزة</option>
          </select>
        </div>
        {loading ? (
          <div className="text-center py-8">جارٍ التحميل...</div>
        ) : error ? (
          <div className="text-center py-8 text-red-600">{error}</div>
        ) : (
          <div className="grid gap-4">
            {list.map(t=> (
              <div key={t.id} className="rounded-2xl border bg-white p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-slate-900">{t.title}</h3>
                  <span className="text-xs rounded-full px-2 py-0.5 ring-1 ring-slate-200">
                    {t.status==="done"?"منجزة":t.status==="in_progress"?"قيد التنفيذ":t.status==="cancelled"?"ملغاة":t.status==="archived"?"مؤرشفة":"مفتوحة"}
                  </span>
                </div>
                <p className="text-sm text-slate-600 mt-1">
                  المسؤول: {t.assignee||"غير محدد"} — الاستحقاق: {t.dueDate || t.due || "—"}
                  {t.propertyId && <span className="ml-2 text-xs text-blue-600">العقار: {t.propertyId}</span>}
                </p>
              </div>
            ))}
            {list.length === 0 && (
              <div className="text-center py-8 text-slate-500">لا توجد مهام</div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

    export default function Page() {
      const { dir } = useI18n();
      return (
        <main dir={dir} className="min-h-screen bg-slate-50 flex flex-col">
          <Head><title>المهام | Ain Oman</title></Head>
          <Header />
          <div className="flex-1">
            <Content />
          </div>
          <Footer />
        </main>
      );
    }