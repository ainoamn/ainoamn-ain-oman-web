// src/components/admin/ModuleDashboard.tsx
import { Widgets, DASHBOARDS, type WidgetKey } from "@/lib/admin/dashboards";
import SectionToolbar from "@/components/admin/SectionToolbar";
function ModuleDashboard({ section }: { section: string }) {
  const layout =
    DASHBOARDS[section] ||
    { left: ["alerts-banner","stats-overview","recent-activity"] as WidgetKey[], right: ["notifications","quick-actions","system-health"] as WidgetKey[] };

  return (
    <div className="space-y-4">
      <SectionToolbar section={section} />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {layout.left.map((k) => {
            const C = Widgets[k];
            return C ? <C key={k} /> : null;
          })}
        </div>
        <div className="space-y-6">
          {layout.right.map((k) => {
            const C = Widgets[k];
            return C ? <C key={k} /> : null;
          })}
        </div>
      </div>
    </div>
  );
}
