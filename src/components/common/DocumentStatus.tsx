import React from "react";
import { daysUntil } from "@/utils/date";
export function DocumentStatus({ expiry }: { expiry?: string }) {
  if (!expiry) return <span className="text-xs text-neutral-500">—</span>;
  const d = daysUntil(expiry);
  if (d < 0) return <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-700">منتهي</span>;
  if (d <= 7) return <span className="px-2 py-1 rounded-full text-xs bg-amber-100 text-amber-700">ينتهي قريبًا</span>;
  return <span className="px-2 py-1 rounded-full text-xs bg-emerald-100 text-emerald-700">ساري</span>;
}
