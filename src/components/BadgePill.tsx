import React from "react";

export function BadgePill({ label, tone = "emerald" }: { label: string; tone?: "emerald" | "sky" | "amber" | "violet" }) {
  const toneMap: Record<string, string> = {
    emerald: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    sky: "bg-sky-50 text-sky-700 ring-sky-200",
    amber: "bg-amber-50 text-amber-700 ring-amber-200",
    violet: "bg-violet-50 text-violet-700 ring-violet-200",
  };
  const classes = toneMap[tone] ?? toneMap.emerald;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs ring-1 ${classes}`}>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-3 w-3" aria-hidden="true">
        <path d="M9 16.2l-3.5-3.5L4 14.2l5 5 11-11-1.5-1.5z"></path>
      </svg>
      {label}
    </span>
  );
}
