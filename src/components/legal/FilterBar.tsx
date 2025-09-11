// src/components/legal/FilterBar.tsx
import React from "react";

export type FilterValues = {
  dateFrom?: string;
  dateTo?: string;
  type?: string;        // caseType أو وسم
  court?: string;       // courtName أو courtId
  status?: string;      // OPEN | ON_HOLD | CLOSED
  stage?: string;       // FILING | HEARING | ...
  lawyer?: string;      // primaryLawyerId أو اسم
  client?: string;      // clientId أو اسم
  opponent?: string;    // plaintiff/defendant
};

export default function FilterBar({
  onApply,
  onReset,
  initial,
}: {
  onApply: (v: FilterValues) => void;
  onReset: () => void;
  initial?: FilterValues;
}) {
  const [v, setV] = React.useState<FilterValues>({
    dateFrom: initial?.dateFrom || "",
    dateTo: initial?.dateTo || "",
    type: initial?.type || "",
    court: initial?.court || "",
    status: initial?.status || "",
    stage: initial?.stage || "",
    lawyer: initial?.lawyer || "",
    client: initial?.client || "",
    opponent: initial?.opponent || "",
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onApply(v);
  };

  const reset = () => {
    setV({}); onReset();
  };

  return (
    <form onSubmit={onSubmit} className="p-4 border rounded bg-white shadow-sm space-y-3">
      <h3 className="font-semibold text-lg">مرشحات إضافية</h3>
      <div className="grid md:grid-cols-4 gap-3">
        <div className="flex gap-2">
          <input type="date" className="border rounded p-2 w-full" value={v.dateFrom || ""} onChange={e=>setV({...v, dateFrom:e.target.value})} />
          <input type="date" className="border rounded p-2 w-full" value={v.dateTo || ""} onChange={e=>setV({...v, dateTo:e.target.value})} />
        </div>
        <input className="border rounded p-2" placeholder="النوع" value={v.type || ""} onChange={e=>setV({...v, type:e.target.value})} />
        <input className="border rounded p-2" placeholder="المحكمة" value={v.court || ""} onChange={e=>setV({...v, court:e.target.value})} />
        <select className="border rounded p-2" value={v.status || ""} onChange={e=>setV({...v, status:e.target.value})}>
          <option value="">جميع الحالات</option>
          <option value="OPEN">مفتوحة</option>
          <option value="ON_HOLD">معلّقة</option>
          <option value="CLOSED">مغلقة</option>
        </select>
        <select className="border rounded p-2" value={v.stage || ""} onChange={e=>setV({...v, stage:e.target.value})}>
          <option value="">جميع المراحل</option>
          <option value="FILING">قيد القيد</option>
          <option value="HEARING">جلسات</option>
          <option value="APPEAL">استئناف</option>
          <option value="JUDGMENT">حكم</option>
          <option value="EXECUTION">تنفيذ</option>
          <option value="ARCHIVED">أرشيف</option>
        </select>
        <input className="border rounded p-2" placeholder="المحامي" value={v.lawyer || ""} onChange={e=>setV({...v, lawyer:e.target.value})} />
        <input className="border rounded p-2" placeholder="العميل" value={v.client || ""} onChange={e=>setV({...v, client:e.target.value})} />
        <input className="border rounded p-2" placeholder="الخصم" value={v.opponent || ""} onChange={e=>setV({...v, opponent:e.target.value})} />
      </div>
      <div className="flex gap-2 justify-end">
        <button type="button" onClick={reset} className="px-4 py-2 rounded border">إعادة ضبط</button>
        <button type="submit" className="px-4 py-2 rounded bg-black text-white">تطبيق</button>
      </div>
    </form>
  );
}
