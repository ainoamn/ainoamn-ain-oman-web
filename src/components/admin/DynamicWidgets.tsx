// src/components/admin/DynamicWidgets.tsx
import { widgetRegistry, type DashboardLayout } from "@/lib/admin/widgets-registry";
function DynamicWidgets({ layout }: { layout: DashboardLayout }) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        {layout.left.map((sec, idx) => (
          <section key={`l-${idx}`}>
            {sec.title ? <h3 className="mb-3 text-base font-semibold text-slate-900">{sec.title}</h3> : null}
            <div className="space-y-6">
              {sec.widgets.map((k) => {
                const C = widgetRegistry[k];
                return C ? <C key={k} /> : null;
              })}
            </div>
          </section>
        ))}
      </div>
      <div className="space-y-6">
        {layout.right.map((sec, idx) => (
          <section key={`r-${idx}`}>
            {sec.title ? <h3 className="mb-3 text-base font-semibold text-slate-900">{sec.title}</h3> : null}
            <div className="space-y-6">
              {sec.widgets.map((k) => {
                const C = widgetRegistry[k];
                return C ? <C key={k} /> : null;
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
