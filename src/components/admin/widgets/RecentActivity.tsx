// src/components/admin/widgets/RecentActivity.tsx
// Client widget: show recent quick links as activity placeholder.
import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslation } from "@/hooks/useTranslation";

type QuickLink = { id: string; label: string; href: string; icon?: string; group?: string; createdAt: string };

export default function RecentActivity() {
  const { t, dir } = useTranslation();
  const [items, setItems] = useState<QuickLink[]>([]);

  useEffect(() => {
    fetch("/api/admin/links")
      .then((r) => r.json())
      .then((d) => setItems((d?.links || []).slice(0, 6)))
      .catch(() => setItems([]));
  }, []);

  return (
    <section dir={dir} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="mb-3 text-base font-semibold text-slate-900">{t("admin.activity.title", "النشاط الأخير")}</h3>
      {items.length ? (
        <ul className="space-y-2">
          {items.map((it) => (
            <li key={it.id} className="flex items-center justify-between rounded-xl border border-slate-100 p-3">
              <Link href={it.href} className="text-slate-900 hover:underline">{it.label}</Link>
              <time className="text-xs text-slate-500">{new Date(it.createdAt).toLocaleString()}</time>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-slate-500">{t("admin.activity.empty", "لا يوجد نشاط بعد.")}</p>
      )}
    </section>
  );
}
