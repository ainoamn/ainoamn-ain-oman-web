// src/pages/tasks/compat.tsx
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";

type Task = {
  id: string;
  title: string;
  status?: string;
  type?: string;
  assignee?: string | null;
  dueDate?: string | null;
  description?: string;
  propertyId: string;
  bookingId?: string | null;
  createdAt?: string;
  updatedAt?: string;
  [k: string]: any;
};

function arr(x: any): any[] {
  if (Array.isArray(x)) return x;
  if (Array.isArray(x?.items)) return x.items;
  if (Array.isArray(x?.data)) return x.data;
  return [];
}

async function getJson(url: string, signal?: AbortSignal) {
  const r = await fetch(url, { cache: "no-store", credentials: "include", signal });
  if (!r.ok) throw new Error(`${r.status}`);
  try { return await r.json(); } catch { return []; }
}

export default function TasksCompat() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [propertyId, setPropertyId] = useState<string>("");
  const [items, setItems] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  // احصل على query بعد جاهزية الراوتر
  useEffect(() => {
    if (!router.isReady) return;
    setPropertyId(typeof router.query.propertyId === "string" ? router.query.propertyId : "");
    setReady(true);
  }, [router.isReady, router.query.propertyId]);

  async function load(pid: string) {
    console.log("Loading tasks for propertyId:", pid);
    setLoading(true);
    const ac = new AbortController();
    const t = setTimeout(() => ac.abort("timeout"), 6000); // حد زمني 6 ثوانٍ

    try {
      // استخدام API المبسط مع propertyId
      const url = `/api/tasks/simple${pid ? `?propertyId=${encodeURIComponent(pid)}` : ""}`;
      const response = await fetch(url, { 
        cache: "no-store", 
        credentials: "include", 
        signal: ac.signal 
      });
      
      if (response.ok) {
        const data = await response.json();
        const tasks = Array.isArray(data.tasks) ? data.tasks : [];
        console.log("Loaded tasks:", tasks.length, "for propertyId:", pid);
        setItems(tasks);
      } else {
        console.error("Failed to fetch tasks:", response.status);
        setItems([]);
      }
    } catch (error) {
      console.error("Error loading tasks:", error);
      setItems([]);
    } finally {
      clearTimeout(t);
      setLoading(false);
    }
  }

  async function setStatus(id: string, status: string) {
    try {
      // استخدام API المبسط لتحديث المهمة
      const r = await fetch("/api/tasks/simple", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id, status }),
      });
      
      if (r.ok) {
        console.log("Task status updated successfully");
        // إرسال إشعار لتحديث الصفحات الأخرى
        try {
          const bc = new BroadcastChannel("ao_tasks");
          bc.postMessage({ type: "updated", taskId: id, propertyId });
          bc.close();
        } catch {}
        
        // تحديث localStorage لإشعار الصفحات الأخرى
        try {
          localStorage.setItem("ao_tasks_bump", Date.now().toString());
        } catch {}
        
        // إعادة تحميل البيانات
        load(propertyId);
      } else {
        console.error("Failed to update task status:", r.status);
        throw new Error();
      }
    } catch (error) {
      console.error("Error updating task status:", error);
      // تحديث محلي في حالة فشل API
      setItems((list) => list.map((t) => (t.id === id ? { ...t, status } : t)));
    }
  }

  async function addNewTask() {
    const title = prompt("عنوان المهمة الجديدة:");
    if (!title?.trim()) return;
    
    try {
      const newTask = {
        title: title.trim(),
        status: "open",
        type: "maintenance",
        propertyId: propertyId,
        assignee: null,
        dueDate: null,
        description: `مهمة جديدة للعقار ${propertyId}`,
        priority: "medium"
      };
      
      const r = await fetch("/api/tasks/simple", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(newTask),
      });
      
      if (r.ok) {
        console.log("New task created successfully");
        // إرسال إشعار لتحديث الصفحات الأخرى
        try {
          const bc = new BroadcastChannel("ao_tasks");
          bc.postMessage({ type: "updated", propertyId });
          bc.close();
        } catch {}
        
        // تحديث localStorage لإشعار الصفحات الأخرى
        try {
          localStorage.setItem("ao_tasks_bump", Date.now().toString());
        } catch {}
        
        // إعادة تحميل البيانات
        load(propertyId);
      } else {
        console.error("Failed to create task:", r.status);
        alert("فشل في إضافة المهمة");
      }
    } catch (error) {
      console.error("Error creating task:", error);
      alert("خطأ في إضافة المهمة");
    }
  }

  useEffect(() => {
    if (!ready) return;
    load(propertyId);

    // الاستماع لتحديثات المهام
    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel("ao_tasks");
      bc.onmessage = (ev) => {
        if (ev?.data?.type === "updated") {
          console.log("Received task update broadcast:", ev.data);
          // إعادة تحميل البيانات عند أي تحديث مع تأخير صغير لضمان تحديث البيانات
          setTimeout(() => {
            console.log("Reloading tasks after broadcast");
            load(propertyId);
          }, 100);
        }
      };
    } catch {}

    function onStorage(ev: StorageEvent) {
      if (ev.key === "ao_tasks_bump") load(propertyId);
    }
    window.addEventListener("storage", onStorage);

    return () => {
      window.removeEventListener("storage", onStorage);
      try { bc?.close(); } catch {}
    };
  }, [ready, propertyId]);

  const rows = useMemo(
    () =>
      items.map((t) => (
        <tr key={t.id} className="border-t">
          <td className="p-3 font-mono">{t.id}</td>
          <td className="p-3">
            {t.title}
            {t.bookingId && <span className="ml-2 text-xs text-blue-600">(حجز: {t.bookingId})</span>}
          </td>
          <td className="p-3">{t.type || "-"}</td>
          <td className="p-3">{t.assignee || "-"}</td>
          <td className="p-3">{t.dueDate || "-"}</td>
          <td className="p-3">
            {t.status === "done" ? "منجزة" : 
             t.status === "in_progress" ? "قيد التنفيذ" : 
             t.status === "cancelled" ? "ملغاة" : 
             t.status === "archived" ? "مؤرشفة" : 
             t.status === "open" ? "مفتوحة" : 
             t.status || "-"}
          </td>
          <td className="p-3">
            <div className="flex gap-2">
              <button className="px-3 py-1 rounded border" onClick={() => setStatus(t.id, "open")}>فتح</button>
              <button className="px-3 py-1 rounded border" onClick={() => setStatus(t.id, "in_progress")}>قيد التنفيذ</button>
              <button className="px-3 py-1 rounded border" onClick={() => setStatus(t.id, "done")}>منجز</button>
            </div>
          </td>
        </tr>
      )),
    [items]
  );

  if (!ready) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-6xl p-6">جار التحميل…</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold mb-2">مهامي المتوافقة</h1>
            <div className="text-sm text-slate-500">
              {propertyId ? <>خاص بالعقار: <span className="font-mono">{propertyId}</span></> : "كل المهام"}
            </div>
          </div>
          {propertyId && (
            <button
              onClick={addNewTask}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
            >
              إضافة مهمة جديدة
            </button>
          )}
        </div>

        <div className="overflow-x-auto rounded-xl shadow bg-white">
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

            {!loading && items.length === 0 && (
              <tbody>
                <tr>
                  <td className="p-3 text-slate-500" colSpan={7}>لا توجد مهام.</td>
                </tr>
              </tbody>
            )}
          </table>

          {loading && <div className="p-4">جار التحميل…</div>}
        </div>
      </div>
    </main>
  );
}
