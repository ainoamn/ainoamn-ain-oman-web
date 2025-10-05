// src/components/admin/widgets/SystemHealth.tsx
// Client widget: feature flags and simple status.
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";

type Flags = Record<string, boolean>;

export default function SystemHealth() {
  const { t, dir } = useTranslation();
  const [flags, setFlags] = useState<Flags>({});

  useEffect(() => {
    fetch("/api/config/feature-flags").then((r) => r.json()).then(setFlags).catch(() => setFlags({}));
  }, []);

  const entries = useMemo(() => Object.entries(flags), [flags]);

  return (
    <section dir={dir} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="mb-3 text-base font-semibold text-slate-900">{t("admin.health.title", "صحة النظام")}</h3>
      {entries.length ? (
        <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {entries.map(([k, v]) => (
            <li key={k} className="flex items-center justify-between rounded-xl border border-slate-100 p-3">
              <span className="text-slate-700">{k}</span>
              <span className={`h-2 w-2 rounded-full ${v ? "bg-emerald-500" : "bg-slate-300"}`} aria-hidden />
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-slate-500">{t("admin.health.empty", "لا توجد خصائص مفعلة.")}</p>
      )}
    </section>
  );
}
