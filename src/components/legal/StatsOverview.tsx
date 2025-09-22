import React from "react";
type LegalCase = { status: "OPEN"|"ON_HOLD"|"CLOSED" };
function StatsOverview({ items }: { items: LegalCase[] }) {
  const total = items?.length ?? 0;
  const open = (items||[]).filter(i=>i.status==="OPEN").length;
  const onHold = (items||[]).filter(i=>i.status==="ON_HOLD").length;
  const closed = (items||[]).filter(i=>i.status==="CLOSED").length;
  return (
    <div className="grid md:grid-cols-3 gap-3">
      <div className="p-3 border rounded bg-white"><div className="text-xs opacity-70">الإجمالي</div><div className="text-2xl font-semibold">{total}</div></div>
      <div className="p-3 border rounded bg-white"><div className="text-xs opacity-70">مفتوحة</div><div className="text-2xl font-semibold">{open}</div></div>
      <div className="p-3 border rounded bg-white"><div className="text-xs opacity-70">مقفلة</div><div className="text-2xl font-semibold">{closed}</div></div>
      <div className="p-3 border rounded bg-white md:col-span-3"><div className="text-xs opacity-70">معلقة</div><div className="text-2xl font-semibold">{onHold}</div></div>
    </div>
  );
}
