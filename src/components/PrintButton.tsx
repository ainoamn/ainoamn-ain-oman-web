import React from "react";

export function PrintButton({ label = "طباعة" }: { label?: string }) {
  return (
    <button
      onClick={() => window.print()}
      className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-4 w-4 fill-current">
        <path d="M6 2h12v5H6zM19 8H5a3 3 0 00-3 3v5h4v4h12v-4h4v-5a3 3 0 00-3-3zM7 20v-4h10v4H7z" />
      </svg>
      {label}
    </button>
  );
}