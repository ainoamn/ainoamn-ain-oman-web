// src/components/search/AdvancedFiltersPanel.tsx
import { useState } from "react";

export type AdvancedFilters = {
  priceMin?: number; priceMax?: number;
  bedsMin?: number; bathsMin?: number;
  areaMin?: number; areaMax?: number;
 sortBy?: "newest" | "priceAsc" | "priceDesc" | "rating" | "views" | "";
};
function AdvancedFiltersPanel({
  open, onClose, onApply, initial
}: {
  open: boolean;
  onClose: () => void;
  onApply: (f: AdvancedFilters) => void;
  initial?: AdvancedFilters;
}) {
  const [f, setF] = useState<AdvancedFilters>(initial ?? {});
  const upd = (p: Partial<AdvancedFilters>) => setF(prev => ({ ...prev, ...p }));

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 bg-black/40 flex items-end md:items-center justify-center">
      <div className="bg-white rounded-t-2xl md:rounded-2xl w-full md:max-w-3xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold">الفلاتر المتقدمة</h3>
          <button onClick={onClose} className="text-red-600">إغلاق</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="text-sm text-gray-600">السعر الأدنى</label>
            <input type="number" className="border rounded p-2 w-full"
              value={f.priceMin ?? ""} onChange={e => upd({ priceMin: e.target.value ? +e.target.value : undefined })}/>
          </div>
          <div>
            <label className="text-sm text-gray-600">السعر الأقصى</label>
            <input type="number" className="border rounded p-2 w-full"
              value={f.priceMax ?? ""} onChange={e => upd({ priceMax: e.target.value ? +e.target.value : undefined })}/>
          </div>

          <div>
            <label className="text-sm text-gray-600">غرف (≥)</label>
            <input type="number" className="border rounded p-2 w-full"
              value={f.bedsMin ?? ""} onChange={e => upd({ bedsMin: e.target.value ? +e.target.value : undefined })}/>
          </div>
          <div>
            <label className="text-sm text-gray-600">حمامات (≥)</label>
            <input type="number" className="border rounded p-2 w-full"
              value={f.bathsMin ?? ""} onChange={e => upd({ bathsMin: e.target.value ? +e.target.value : undefined })}/>
          </div>

          <div>
            <label className="text-sm text-gray-600">المساحة من (م²)</label>
            <input type="number" className="border rounded p-2 w-full"
              value={f.areaMin ?? ""} onChange={e => upd({ areaMin: e.target.value ? +e.target.value : undefined })}/>
          </div>
          <div>
            <label className="text-sm text-gray-600">المساحة إلى (م²)</label>
            <input type="number" className="border rounded p-2 w-full"
              value={f.areaMax ?? ""} onChange={e => upd({ areaMax: e.target.value ? +e.target.value : undefined })}/>
          </div>

          <div className="md:col-span-3">
            <label className="text-sm text-gray-600">الفرز حسب</label>
            <select className="border rounded p-2 w-full"
              value={f.sortBy ?? ""} onChange={e => upd({ sortBy: e.target.value as any })}>
              <option value="">—</option>
              <option value="newest">الأحدث</option>
              <option value="priceAsc">السعر ↑</option>
              <option value="priceDesc">السعر ↓</option>
              <option value="rating">التقييم</option>
              <option value="views">المشاهدة</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-end gap-2">
          <button className="px-4 py-2 rounded border" onClick={onClose}>إلغاء</button>
          <button className="px-5 py-2 rounded bg-[var(--brand-600)] text-white hover:bg-[var(--brand-700)]"
            onClick={() => { onApply(f); onClose(); }}>
            تطبيق الفلاتر
          </button>
        </div>
      </div>
    </div>
  );
}
