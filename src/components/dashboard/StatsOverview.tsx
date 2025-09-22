// root: src/components/dashboard/StatsOverview.tsx
import React from "react";

type Stats = {
  totalProperties: number;
  activeRentals: number;
  completedRentals: number;
  pendingActions: number;
};
function StatsOverview({ stats }: { stats: Stats }) {
  const items = [
    { key: "totalProperties", label: "إجمالي العقارات", value: stats.totalProperties, tint: "bg-blue-50", dot: "bg-blue-500" },
    { key: "activeRentals", label: "حجوزات نشطة", value: stats.activeRentals, tint: "bg-emerald-50", dot: "bg-emerald-500" },
    { key: "completedRentals", label: "عقود مكتملة", value: stats.completedRentals, tint: "bg-indigo-50", dot: "bg-indigo-500" },
    { key: "pendingActions", label: "إجراءات معلّقة", value: stats.pendingActions, tint: "bg-amber-50", dot: "bg-amber-500" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {items.map((it) => (
        <div key={it.key} className={`rounded-2xl ${it.tint} p-4`}>
          <div className="flex items-center justify-between">
            <span className={`inline-block w-2 h-2 rounded-full ${it.dot}`} />
            <span className="text-2xl font-bold">{it.value}</span>
          </div>
          <div className="mt-2 text-sm text-gray-700">{it.label}</div>
        </div>
      ))}
    </div>
  );
}
