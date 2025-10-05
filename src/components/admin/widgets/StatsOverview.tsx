// src/components/admin/widgets/StatsOverview.tsx
import { useEffect, useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";

type KPIs = { users: number; properties: number; tasks: number; revenue: number };

export default function StatsOverview() {
  const { t } = useTranslation();
  const [kpi, setKpi] = useState<KPIs>({ users: 0, properties: 0, tasks: 0, revenue: 0 });

  useEffect(() => {
    fetch("/api/admin/kpis").then((r) => r.json()).then(setKpi).catch(() => {});
  }, []);

  const cards = [
    { label: t("stats.users") || "المستخدمون", value: kpi.users },
    { label: t("stats.properties") || "العقارات", value: kpi.properties },
    { label: t("stats.tasks") || "المهام", value: kpi.tasks },
    { label: t("stats.revenue") || "الإيرادات", value: kpi.revenue },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((c) => (
        <div key={c.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="text-sm text-slate-500">{c.label}</div>
          <div className="mt-1 text-2xl font-bold text-slate-900">{c.value}</div>
        </div>
      ))}
    </div>
  );
}
