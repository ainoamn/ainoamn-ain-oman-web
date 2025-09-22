// src/components/legal/QuickActions.tsx
import React from "react";
function QuickActions({
  onNew,
  onDirectory,
  onExport,
  onPrint,
  viewMode,
  onViewModeChange,
}: {
  onNew: () => void;
  onDirectory: () => void;
  onExport?: () => void;
  onPrint?: () => void;
  viewMode?: "grid" | "list";
  onViewModeChange?: (m: "grid" | "list") => void;
}) {
  return (
    <div className="flex flex-wrap gap-2 items-center">
      <button onClick={onNew} className="px-4 py-2 rounded bg-black text-white">+ قضية جديدة</button>
      <button onClick={onDirectory} className="px-4 py-2 rounded border">إدارة المحامين/العملاء</button>
      {onExport && <button onClick={onExport} className="px-4 py-2 rounded border">تصدير CSV</button>}
      {onPrint && <button onClick={onPrint} className="px-4 py-2 rounded border">طباعة</button>}
      {onViewModeChange && (
        <div className="ml-auto flex gap-1">
          <button onClick={()=>onViewModeChange!("grid")} className={`px-3 py-2 rounded border ${viewMode==="grid"?"bg-gray-900 text-white":""}`}>شبكي</button>
          <button onClick={()=>onViewModeChange!("list")} className={`px-3 py-2 rounded border ${viewMode==="list"?"bg-gray-900 text-white":""}`}>قائمة</button>
        </div>
      )}
    </div>
  );
}
