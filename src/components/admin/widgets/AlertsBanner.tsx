// src/components/admin/widgets/AlertsBanner.tsx
import { useEffect, useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";

type Alert = { id: string; text: string; level?: "info" | "warning" | "error" | "success" };
function AlertsBanner() {
  const { t } = useTranslation();
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    // Pull top 3 unread notifications and show as banner
    fetch("/api/admin/notifications").then((r) => r.json()).then((d) => {
      const items = (d.notifications || []).filter((n: any) => !n.read).slice(0, 3).map((n: any) => ({
        id: n.id, text: n.title, level: n.level
      }));
      setAlerts(items);
    }).catch(() => setAlerts([]));
  }, []);

  if (!alerts.length) return null;

  const color = (lvl?: string) => lvl === "error" ? "bg-red-50 text-red-700 border-red-200"
    : lvl === "warning" ? "bg-amber-50 text-amber-800 border-amber-200"
    : lvl === "success" ? "bg-emerald-50 text-emerald-700 border-emerald-200"
    : "bg-sky-50 text-sky-700 border-sky-200";

  return (
    <div className="space-y-2">
      {alerts.map((a) => (
        <div key={a.id} className={`rounded-xl border px-4 py-3 ${color(a.level)}`}>
          {a.text}
        </div>
      ))}
    </div>
  );
}
