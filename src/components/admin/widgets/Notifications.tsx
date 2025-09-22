// src/components/admin/widgets/Notifications.tsx
import { useEffect, useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";

type Notification = {
  id: string;
  title: string;
  message?: string;
  level?: "info" | "success" | "warning" | "error";
  createdAt: string;
  read: boolean;
};
function Notifications() {
  const { t, dir } = useTranslation();
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    fetch("/api/admin/notifications")
      .then((r) => r.json())
      .then((d) => setItems(d.notifications || []))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  async function mark(id: string, read: boolean) {
    await fetch("/api/admin/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, read }),
    });
    load();
  }

  async function remove(id: string) {
    await fetch(`/api/admin/notifications?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    load();
  }

  return (
    <section dir={dir} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-base font-semibold text-slate-900">{t("dashboard.notifications") || "التنبيهات"}</h3>
        <button onClick={load} className="text-sm text-slate-500 hover:underline">{t("common.refresh") || "تحديث"}</button>
      </div>
      {loading ? (
        <p className="text-sm text-slate-500">{t("common.loading") || "جارٍ التحميل..."}</p>
      ) : items.length ? (
        <ul className="space-y-2">
          {items.map((n) => (
            <li key={n.id} className="flex items-start justify-between rounded-xl border border-slate-100 p-3">
              <div className="pe-3">
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${n.level === "error" ? "bg-red-500" : n.level === "warning" ? "bg-amber-500" : n.level === "success" ? "bg-emerald-500" : "bg-sky-500"}`} aria-hidden />
                  <span className={`text-sm ${n.read ? "text-slate-500" : "text-slate-900 font-medium"}`}>{n.title}</span>
                </div>
                {n.message ? <p className="mt-1 text-xs text-slate-600">{n.message}</p> : null}
                <time className="mt-1 block text-[10px] text-slate-400">{new Date(n.createdAt).toLocaleString()}</time>
              </div>
              <div className="ms-3 flex items-center gap-2">
                <button onClick={() => mark(n.id, !n.read)} className="rounded-xl border border-slate-300 px-2 py-1 text-xs hover:bg-slate-50">
                  {n.read ? (t("notifications.markUnread") || "تعليم كغير مقروء") : (t("notifications.markRead") || "تعليم كمقروء")}
                </button>
                <button onClick={() => remove(n.id)} className="rounded-xl border border-slate-300 px-2 py-1 text-xs hover:bg-slate-50">
                  {t("common.delete") || "حذف"}
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-slate-500">{t("notifications.empty") || "لا توجد تنبيهات."}</p>
      )}
    </section>
  );
}
