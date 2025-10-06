/**
 * TaskQuickActions
 * أزرار سريعة لتحديث الحالة والأولوية للمهمة.
 * الاستخدام: <TaskQuickActions taskId={task.id} status={task.status} priority={task.priority} onChanged={reload} />
 */
import { useState } from "react";

type Props = {
  taskId: string;
  status: "open" | "in_progress" | "done" | string;
  priority: "low" | "medium" | "high" | "urgent" | string;
  onChanged?: () => void;
};

async function updateTask(taskId: string, patch: Record<string, any>) {
  const res = await fetch("/api/tasks", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: taskId, ...patch }),
  });
  if (!res.ok) {
    // بعض النسخ تتطلب {id, patch:{...}}
    const alt = await fetch("/api/tasks", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: taskId, patch }),
    });
    if (!alt.ok) throw new Error("تعذر تحديث المهمة");
  }
}

export default function TaskQuickActions({ taskId, status, priority, onChanged }: Props) {
  const [busy, setBusy] = useState(false);

  const setStatus = async (s: string) => {
    try { setBusy(true); await updateTask(taskId, { status: s }); onChanged?.(); }
    finally { setBusy(false); }
  };

  const setPriority = async (p: string) => {
    try { setBusy(true); await updateTask(taskId, { priority: p }); onChanged?.(); }
    finally { setBusy(false); }
  };

  const btn = "rounded-lg px-3 py-1.5 text-xs ring-1 ring-gray-200 hover:bg-gray-50 active:scale-[0.99] transition disabled:opacity-60";

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* الحالة */}
      <div className="flex items-center gap-1">
        <span className="text-xs text-gray-500">الحالة:</span>
        <button className={btn} disabled={busy || status === "open"} onClick={() => setStatus("open")}>مفتوحة</button>
        <button className={btn} disabled={busy || status === "in_progress"} onClick={() => setStatus("in_progress")}>قيد العمل</button>
        <button className={btn} disabled={busy || status === "done"} onClick={() => setStatus("done")}>منجزة</button>
      </div>

      {/* الأولوية */}
      <div className="flex items-center gap-1">
        <span className="text-xs text-gray-500">الأولوية:</span>
        <button className={`${btn}`} disabled={busy || priority === "low"} onClick={() => setPriority("low")}>منخفضة</button>
        <button className={`${btn}`} disabled={busy || priority === "medium"} onClick={() => setPriority("medium")}>متوسطة</button>
        <button className={`${btn}`} disabled={busy || priority === "high"} onClick={() => setPriority("high")}>مرتفعة</button>
        <button className={`${btn}`} disabled={busy || priority === "urgent"} onClick={() => setPriority("urgent")}>عاجلة</button>
      </div>
    </div>
  );
}
