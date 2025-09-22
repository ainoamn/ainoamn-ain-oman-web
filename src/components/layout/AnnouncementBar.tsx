// src/components/layout/AnnouncementBar.tsx
"use client";
import { XMarkIcon, MegaphoneIcon, CheckBadgeIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { useHeaderFooterConfig } from "@/hooks/useHeaderFooterConfig";

const COLORS: Record<string, string> = {
  info:    "bg-sky-600",
  success: "bg-emerald-600",
  warning: "bg-amber-600",
  danger:  "bg-rose-600",
};
function AnnouncementBar() {
  const { config, setConfig } = useHeaderFooterConfig();
  const visible = config.announcements.filter(a => a.visible);

  if (!visible.length) return null;

  const iconFor = (lvl:string) =>
    lvl==="success" ? <CheckBadgeIcon className="w-5 h-5" /> :
    lvl==="warning" ? <ExclamationTriangleIcon className="w-5 h-5" /> :
    lvl==="danger"  ? <ExclamationTriangleIcon className="w-5 h-5" /> :
    <MegaphoneIcon className="w-5 h-5" />;

  const close = (id:string) => {
    const next = config.announcements.map(a => a.id===id ? { ...a, visible:false } : a);
    setConfig({ announcements: next });
  };

  return (
    <div className="sticky top-0 z-[60]">
      {visible.map(a => (
        <div key={a.id} className={`${COLORS[a.level]} text-white`}>
          <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-6 py-2 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {iconFor(a.level)}
              <span className="text-sm">{a.text}</span>
            </div>
            {a.closable && (
              <button onClick={() => close(a.id)} aria-label="إغلاق" className="p-1 rounded hover:bg-black/10">
                <XMarkIcon className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
