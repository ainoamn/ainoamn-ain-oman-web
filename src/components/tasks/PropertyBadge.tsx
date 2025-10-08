// src/components/tasks/PropertyBadge.tsx
import React, { useEffect, useState } from "react";

type PropertyMini = {
  id: string;
  referenceNo?: string;
  title?: string | { ar?: string; en?: string };
  buildingNumber?: string;
  province?: string;
  state?: string;
  village?: string;
};

function getTitle(p?: PropertyMini): string {
  if (!p) return "";
  const t = p.title as any;
  if (!t) return p.referenceNo || p.id;
  if (typeof t === "string") return t;
  return t.ar || t.en || p.referenceNo || p.id;
}

function getLocation(p?: PropertyMini): string {
  if (!p) return "";
  const parts = [p.province, p.state, p.village].filter(Boolean);
  return parts.join(" - ");
}

export default function PropertyBadge({
  propertyId,
  taskId,
  className,
}: {
  propertyId?: string;
  taskId?: string;
  className?: string;
}) {
  const [prop, setProp] = useState<PropertyMini | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!propertyId) return;
      try {
        setLoading(true);
        const r = await fetch(`/api/properties/${encodeURIComponent(propertyId)}`, { cache: "no-store" });
        if (!r.ok) return;
        const j = await r.json();
        const item = j?.item || j;
        if (!cancelled) setProp(item || null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => { cancelled = true; };
  }, [propertyId]);

  const base = "inline-flex items-center gap-2 px-2.5 py-1 rounded-xl text-[11px] font-medium border transition-colors";

  if (propertyId) {
    return (
      <div className={className}>
        <span className={`${base} bg-emerald-50/70 border-emerald-200 text-emerald-700 hover:bg-emerald-100`}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
            <path d="M11.47 3.84a.75.75 0 0 1 1.06 0l8 8a.75.75 0 1 1-1.06 1.06L20 12.53V20a2 2 0 0 1-2 2h-3.25a.75.75 0 0 1-.75-.75V15a.75.75 0 0 0-.75-.75h-2.5A.75.75 0 0 0 11 15v6.25a.75.75 0 0 1-.75.75H7a2 2 0 0 1-2-2v-7.47l-.47.47a.75.75 0 1 1-1.06-1.06l8-8Z" />
          </svg>
          {loading ? (
            <span>عقار: تحميل…</span>
          ) : (
            <span className="flex items-center gap-2">
              <span>عقار:</span>
              <span className="font-semibold">{prop?.referenceNo || propertyId}</span>
              <span className="text-slate-500">•</span>
              <span className="truncate max-w-[10rem]" title={getTitle(prop)}>{getTitle(prop)}</span>
              {getLocation(prop) ? (
                <span className="text-slate-500 hidden md:inline">— {getLocation(prop)}</span>
              ) : null}
            </span>
          )}
        </span>
      </div>
    );
  }

  return (
    <div className={className}>
      <span className={`${base} bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100`}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
          <path fillRule="evenodd" d="M7.5 3a1.5 1.5 0 0 0-1.5 1.5V21l6-3 6 3V4.5A1.5 1.5 0 0 0 16.5 3h-9Z" clipRule="evenodd" />
        </svg>
        <span>مهمة:</span>
        <span className="font-semibold">{taskId || "غير معرف"}</span>
      </span>
    </div>
  );
}


