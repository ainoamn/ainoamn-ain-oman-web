// src/components/search/FiltersSidebar.tsx
import { useMemo } from "react";

export type SiteClass =
  | ""
  | "most_interactions"
  | "top_rated"
  | "most_saved"
  | "most_contacts";

export type FiltersValue = {
  // تقييم بالنجوم (متعدد)
  stars?: number[];                // أمثلة: [5,4] أو [1,2,3,4,5] للكل
  // مرافق
  amenities?: string[];
  // أماكن جذب قريبة
  nearbyAttractions?: string[];

  // تصنيف مبني على إحصائيات الموقع
  siteClass?: SiteClass;

  // أعداد ضمن المرافق
  bedroomsMin?: number;            // عدد الغرف ≥
  bathroomsMin?: number;           // عدد دورات المياه ≥

  // مدى السعر
  priceMin?: number;               // ر.ع ≥
  priceMax?: number;               // ر.ع ≤

  // مدى المساحة
  areaMin?: number;                // م² ≥
  areaMax?: number;                // م² ≤
};

export type FiltersCounts = {
  stars?: Record<number, number>;          // {5: n, 4: n, ...}
  amenities?: Record<string, number>;      // {"مصعد": n, ...}
  attractions?: Record<string, number>;    // {"قريب من البحر": n, ...}
};
function FiltersSidebar({
  value,
  onChange,
  onResetAll,
  allAmenities = [],
  allAttractions = [],
  counts
}: {
  value: FiltersValue;
  onChange: (v: FiltersValue) => void;
  onResetAll?: () => void;
  allAmenities?: string[];
  allAttractions?: string[];
  counts?: FiltersCounts;
}) {
  const change = (p: Partial<FiltersValue>) => onChange({ ...value, ...p });

  const toggleInArray = (key: "amenities" | "nearbyAttractions" | "stars", item: string | number) => {
    const arr = new Set((value as any)[key] ?? []);
    arr.has(item) ? arr.delete(item) : arr.add(item);
    onChange({ ...value, [key]: Array.from(arr) } as any);
  };

  const starsOptions = useMemo(() => [5, 4, 3, 2, 1], []);
  const allStarsSelected = (value.stars ?? []).length === starsOptions.length;

  const selectAllStars = (checked: boolean) => {
    onChange({ ...value, stars: checked ? starsOptions.slice() : [] });
  };

  return (
    <aside className="w-full lg:w-72 bg-white rounded-xl shadow p-3 space-y-4">
      {/* رأس الشريط + زر إعادة التعيين */}
      <div className="flex items-center justify-between">
        <h4 className="font-semibold">الفلاتر</h4>
        {onResetAll && (
          <button
            type="button"
            className="text-xs text-red-600 underline"
            onClick={onResetAll}
            title="إعادة تعيين كل الفلاتر"
          >
            إعادة تعيين الكل
          </button>
        )}
      </div>

      {/* النجوم (متعدد) */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm text-gray-600">التقييم بالنجوم</label>
          <label className="flex items-center gap-2 text-xs">
            <input
              type="checkbox"
              checked={allStarsSelected}
              onChange={(e) => selectAllStars(e.target.checked)}
            />
            تحديد الكل
          </label>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {starsOptions.map((s) => {
            const checked = (value.stars ?? []).includes(s);
            const c = counts?.stars?.[s] ?? 0;
            const dim = c === 0;
            return (
              <label key={s} className={`inline-flex items-center justify-between gap-2 text-sm border rounded px-2 py-1 ${dim ? "opacity-50" : ""}`}>
                <span className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleInArray("stars", s)}
                  />
                  <span>{s} ★</span>
                </span>
                <span className="text-xs text-gray-500">({c})</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* تصنيف الموقع (إحصائيات) */}
      <div>
        <label className="block text-sm text-gray-600 mb-1">تصنيف الموقع (إحصائيات)</label>
        <select
          className="w-full border rounded p-2"
          value={value.siteClass ?? ""}
          onChange={(e) => onChange({ ...value, siteClass: e.target.value as any })}
        >
          <option value="">—</option>
          <option value="most_interactions">الأكثر تفاعلاً</option>
          <option value="top_rated">الأعلى تقييماً</option>
          <option value="most_saved">الأكثر حفظاً</option>
          <option value="most_contacts">الأكثر تواصلاً</option>
        </select>
      </div>

      {/* المرافق + أعداد الغرف/الحمامات */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="block text-sm text-gray-600">المرافق</label>
          <button
            type="button"
            className="text-xs underline"
            onClick={() => onChange({ ...value, amenities: [] })}
          >
            مسح الكل
          </button>
        </div>
        <div className="grid grid-cols-1 gap-2 max-h-44 overflow-auto border rounded p-2">
          {allAmenities.map((a) => {
            const checked = (value.amenities ?? []).includes(a);
            const c = counts?.amenities?.[a] ?? 0;
            const dim = c === 0;
            return (
              <label key={a} className={`inline-flex items-center justify-between gap-2 ${dim ? "opacity-50" : ""}`}>
                <span className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleInArray("amenities", a)}
                  />
                  <span className="text-sm">{a}</span>
                </span>
                <span className="text-xs text-gray-500">({c})</span>
              </label>
            );
          })}
        </div>

        {/* أعداد ضمن المرافق */}
        <div className="grid grid-cols-2 gap-2 mt-2">
          <div>
            <label className="block text-xs text-gray-600 mb-1">الغرف (≥)</label>
            <input
              type="number"
              className="w-full border rounded p-2"
              value={value.bedroomsMin ?? ""}
              onChange={(e) => onChange({ ...value, bedroomsMin: e.target.value ? +e.target.value : undefined })}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">دورات المياه (≥)</label>
            <input
              type="number"
              className="w-full border rounded p-2"
              value={value.bathroomsMin ?? ""}
              onChange={(e) => onChange({ ...value, bathroomsMin: e.target.value ? +e.target.value : undefined })}
            />
          </div>
        </div>
      </div>

      {/* السعر: أكبر من / أصغر من */}
      <div>
        <label className="block text-sm text-gray-600 mb-1">السعر (ر.ع)</label>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            placeholder="≥ الحد الأدنى"
            className="w-full border rounded p-2"
            value={value.priceMin ?? ""}
            onChange={(e) => onChange({ ...value, priceMin: e.target.value ? +e.target.value : undefined })}
          />
          <input
            type="number"
            placeholder="≤ الحد الأقصى"
            className="w-full border rounded p-2"
            value={value.priceMax ?? ""}
            onChange={(e) => onChange({ ...value, priceMax: e.target.value ? +e.target.value : undefined })}
          />
        </div>
      </div>

      {/* المساحة: أكبر من / أصغر من */}
      <div>
        <label className="block text-sm text-gray-600 mb-1">المساحة (م²)</label>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            placeholder="≥ من"
            className="w-full border rounded p-2"
            value={value.areaMin ?? ""}
            onChange={(e) => onChange({ ...value, areaMin: e.target.value ? +e.target.value : undefined })}
          />
          <input
            type="number"
            placeholder="≤ إلى"
            className="w-full border rounded p-2"
            value={value.areaMax ?? ""}
            onChange={(e) => onChange({ ...value, areaMax: e.target.value ? +e.target.value : undefined })}
          />
        </div>
      </div>

      {/* أماكن جذب قريبة */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="block text-sm text-gray-600">أماكن جذب قريبة</label>
          <button
            type="button"
            className="text-xs underline"
            onClick={() => onChange({ ...value, nearbyAttractions: [] })}
          >
            مسح الكل
          </button>
        </div>
        <div className="grid grid-cols-1 gap-2 max-h-44 overflow-auto border rounded p-2">
          {allAttractions.map((a) => {
            const checked = (value.nearbyAttractions ?? []).includes(a);
            const c = counts?.attractions?.[a] ?? 0;
            const dim = c === 0;
            return (
              <label key={a} className={`inline-flex items-center justify-between gap-2 ${dim ? "opacity-50" : ""}`}>
                <span className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleInArray("nearbyAttractions", a)}
                  />
                  <span className="text-sm">{a}</span>
                </span>
                <span className="text-xs text-gray-500">({c})</span>
              </label>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
