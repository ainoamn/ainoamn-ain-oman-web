// src/pages/admin/tasks/[id].tsx
import React, { useCallback, useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import Layout from "@/components/layout/Layout";

type Task = {
  id: string;
  title: string;
  description?: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "open" | "in_progress" | "done" | "archived";
  labels?: string[];
  assignees?: string[];
  createdAt?: string;
  updatedAt?: string;
  attachments?: { id: string; name: string; url?: string }[];
  thread?: { id: string; author: string; ts: string; text: string }[];
};

function arrayBufferToBase64(buf: ArrayBuffer) {
  let binary = "";
  const bytes = new Uint8Array(buf);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) binary += String.fromCharCode(bytes[i]);
  // btoa متاح في المتصفح
  return typeof btoa !== "undefined" ? btoa(binary) : Buffer.from(binary, "binary").toString("base64");
}

const fallbackTask = (id: string): Task => ({
  id,
  title: "مهمة جديدة",
  description: "",
  priority: "medium",
  status: "open",
  labels: [],
  assignees: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  attachments: [],
  thread: [],
});

export default function TaskDetailsPage() {
  const router = useRouter();
  const { id } = router.query as { id?: string };

  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const r = await fetch(`/api/tasks/${encodeURIComponent(String(id))}`, { cache: "no-store" as RequestCache });
      if (r.status === 404) {
        // إنشاء تلقائي عند 404
        const body = fallbackTask(String(id));
        await fetch(`/api/tasks/${encodeURIComponent(String(id))}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        setTask(body);
      } else if (r.ok) {
        // بعض الـ API قد تُرجع {item: {...}} أو الكائن مباشرة
        const j = await r.json();
        const t = (j?.item as Task) ?? (j as Task) ?? fallbackTask(String(id));
        setTask(t);
      } else {
        setTask(fallbackTask(String(id)));
      }
    } catch {
      setTask(fallbackTask(String(id)));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const patch = async (delta: Partial<Task>) => {
    if (!id) return;
    try {
      const r = await fetch(`/api/tasks/${encodeURIComponent(String(id))}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(delta),
      });
      if (r.ok) {
        const j = await r.json();
        const t = (j?.item as Task) ?? (j as Task);
        setTask(t ?? (prev => prev as Task));
      } else {
        setTask(prev => ({ ...(prev ?? fallbackTask(String(id))), ...(delta as any) }));
      }
    } catch {
      setTask(prev => ({ ...(prev ?? fallbackTask(String(id))), ...(delta as any) }));
    }
  };

  const doPrint = () => {
    if (!id) return;
    window.open(`/api/tasks/${encodeURIComponent(String(id))}/print`, "_blank");
  };

  const doICS = () => {
    if (!id) return;
    window.open(`/api/tasks/${encodeURIComponent(String(id))}/ics`, "_blank");
  };

  const sendMessage = async () => {
    if (!id || !msg.trim()) return;
    const entry = { id: `m-${Date.now()}`, author: "admin", ts: new Date().toISOString(), text: msg.trim() };
    setTask(prev => (prev ? { ...prev, thread: [entry, ...(prev.thread ?? [])] } : prev));
    setMsg("");
    try {
      await fetch(`/api/tasks/${encodeURIComponent(String(id))}/thread`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entry),
      });
    } catch {
      // تجاهل — وضع عدم الاتصال
    }
  };

  const uploadAttachment = async (file: File) => {
    if (!id) return;
    const buf = await file.arrayBuffer();
    const b64 = arrayBufferToBase64(buf);
    try {
      await fetch(`/api/tasks/${encodeURIComponent(String(id))}/attachments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: file.name, contentType: file.type, data: b64 }),
      });
      await load();
    } catch {
      alert("تعذّر رفع المرفق (واجهة API غير مفعّلة)");
    }
  };

  if (!id) {
    return (
      <Layout>
        <div className="p-6">لا يوجد رقم مهمة.</div>
      </Layout>
    );
  }

  if (loading || !task) {
    return (
      <Layout>
        <div className="p-6">جارٍ التحميل…</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Head>
        <title>تفاصيل المهمة — {task.title}</title>
      </Head>

      <div className="container mx-auto px-4 py-6 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-bold">تفاصيل المهمة</h1>
          <a href="/admin/tasks" className="text-teal-700 hover:underline">
            رجوع للقائمة
          </a>
        </div>

        <div className="grid md:grid-cols-[1fr,320px] gap-4">
          {/* اللوحة الرئيسية */}
          <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 p-4 bg-white dark:bg-neutral-900 space-y-3">
            <label className="block">
              <div className="text-sm mb-1">العنوان</div>
              <input
                className="border rounded-lg px-3 py-2 w-full"
                value={task.title}
                onChange={e => setTask({ ...(task as Task), title: e.target.value })}
                onBlur={() => patch({ title: task.title })}
              />
            </label>

            <label className="block">
              <div className="text-sm mb-1">الوصف</div>
              <textarea
                className="border rounded-lg px-3 py-2 w-full min-h-[120px]"
                value={task.description ?? ""}
                onChange={e => setTask({ ...(task as Task), description: e.target.value })}
                onBlur={() => patch({ description: task.description })}
              />
            </label>

            <div className="grid md:grid-cols-2 gap-3">
              <label className="block">
                <div className="text-sm mb-1">الأولوية</div>
                <select
                  className="border rounded-lg px-3 py-2 w-full"
                  value={task.priority}
                  onChange={e => {
                    const v = e.target.value as Task["priority"];
                    setTask({ ...(task as Task), priority: v });
                    patch({ priority: v });
                  }}
                >
                  <option value="low">منخفضة</option>
                  <option value="medium">متوسطة</option>
                  <option value="high">مرتفعة</option>
                  <option value="urgent">طارئة</option>
                </select>
              </label>

              <label className="block">
                <div className="text-sm mb-1">الحالة</div>
                <select
                  className="border rounded-lg px-3 py-2 w-full"
                  value={task.status}
                  onChange={e => {
                    const v = e.target.value as Task["status"];
                    setTask({ ...(task as Task), status: v });
                    patch({ status: v });
                  }}
                >
                  <option value="open">مفتوحة</option>
                  <option value="in_progress">قيد التنفيذ</option>
                  <option value="done">منجزة</option>
                  <option value="archived">مؤرشفة</option>
                </select>
              </label>
            </div>
          </div>

          {/* إجراءات جانبية */}
          <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 p-4 bg-white dark:bg-neutral-900 space-y-4">
            <div className="space-y-2">
              <button onClick={doPrint} className="w-full px-4 py-2 rounded-lg border">
                طباعة PDF
              </button>
              <button onClick={doICS} className="w-full px-4 py-2 rounded-lg border">
                توليد ملف ICS
              </button>
            </div>

            <div>
              <div className="text-sm font-semibold mb-2">مرفقات</div>
              <input
                type="file"
                onChange={e => {
                  const f = e.target.files?.[0];
                  if (f) uploadAttachment(f);
                }}
              />
              <div className="mt-3 space-y-2">
                {(task.attachments ?? []).map(att => (
                  <a
                    key={att.id}
                    className="block text-sm text-teal-700 hover:underline"
                    href={att.url || "#"}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {att.name}
                  </a>
                ))}
                {(task.attachments ?? []).length === 0 && (
                  <div className="text-xs text-neutral-500">لا توجد مرفقات.</div>
                )}
              </div>
            </div>

            <div>
              <div className="text-sm font-semibold mb-2">دعوات</div>
              <button
                onClick={async () => {
                  try {
                    await fetch(`/api/tasks/${encodeURIComponent(String(id))}/invite`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ emails: [] }),
                    });
                    alert("تم إرسال الدعوات.");
                  } catch {
                    alert("تعذّر إرسال الدعوات.");
                  }
                }}
                className="w-full px-4 py-2 rounded-lg border"
              >
                إرسال دعوات مراقبة
              </button>
            </div>
          </div>
        </div>

        {/* المحادثة */}
        <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 p-4 bg-white dark:bg-neutral-900">
          <div className="font-semibold mb-3">المحادثة</div>
          <div className="flex gap-2">
            <input
              className="flex-1 border rounded-lg px-3 py-2"
              value={msg}
              onChange={e => setMsg(e.target.value)}
              placeholder="اكتب رسالة…"
            />
            <button onClick={sendMessage} className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white">
              إرسال
            </button>
          </div>
          <div className="mt-4 space-y-3">
            {(task.thread ?? []).map(m => (
              <div key={m.id} className="text-sm border-b last:border-0 pb-2">
                <div className="font-semibold">من: {m.author}</div>
                <div>{m.text}</div>
                <div className="text-xs text-neutral-500">{new Date(m.ts).toLocaleString()}</div>
              </div>
            ))}
            {(task.thread ?? []).length === 0 && (
              <div className="text-sm text-neutral-600">لا توجد رسائل.</div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
