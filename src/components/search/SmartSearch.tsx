// src/components/search/SmartSearch.tsx
import { useMemo, useRef, useState } from "react";
import locationData from "../../lib/locationData";
import { FaSearch } from 'react-icons/fa';

export type SmartSearchPayload = {
  propertyType?: "apartment" | "villa" | "land" | "office" | "shop" | "";
  purpose?: "sale" | "rent" | "investment" | "";
  rentalType?: "daily" | "monthly" | "yearly" | "";
  province?: string; state?: string; village?: string;
  keyword?: string;
};

export default function SmartSearch({
  onSearch, showFiltersButton = false, onOpenFilters
}: {
  onSearch?: (payload: SmartSearchPayload) => void;
  showFiltersButton?: boolean;          // لعرض زر "عرض الفلاتر" أسفل الشريط
  onOpenFilters?: () => void;          // يفتح لوحة الفلاتر المتقدمة
}) {
  const [payload, setPayload] = useState<SmartSearchPayload>({});
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const kwRef = useRef<HTMLDivElement>(null);

  const provinces = locationData.provinces;
  const states = useMemo(
    () => provinces.find(p => p.name === (payload.province ?? ""))?.states ?? [],
    [payload.province, provinces]
  );
  const villages = useMemo(
    () => states.find(s => s.name === (payload.state ?? ""))?.villages ?? [],
    [payload.state, states]
  );

  const update = (p: Partial<SmartSearchPayload>) => setPayload(prev => ({ ...prev, ...p }));
  const handleSearch = () => onSearch?.(payload);

  const onKwChange = (v: string) => {
    update({ keyword: v });
    const k = v.trim().toLowerCase();
    if (k.length >= 2) {
      const pool = ["شقة", "فيلا", "أرض", "مكتب", "محل", "الخوض", "المعبيلة", "القرم", "صلالة", "نزوى"];
      setSuggestions(pool.filter(x => x.includes(k)).slice(0, 6));
    } else setSuggestions([]);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-lg">
      <div className="grid grid-cols-1 md:grid-cols-6 gap-2">
        {/* نوع العقار */}
        <select className="border p-2 rounded" value={payload.propertyType ?? ""} onChange={e => update({ propertyType: e.target.value as any })}>
          <option value="">نوع العقار</option>
          <option value="apartment">شقة</option>
          <option value="villa">فيلا</option>
          <option value="land">أرض</option>
          <option value="office">مكتب</option>
          <option value="shop">محل تجاري</option>
        </select>

        {/* الغرض */}
        <select className="border p-2 rounded" value={payload.purpose ?? ""} onChange={e => update({ purpose: e.target.value as any })}>
          <option value="">الغرض</option>
          <option value="sale">للبيع</option>
          <option value="rent">للإيجار</option>
          <option value="investment">استثمار</option>
        </select>

        {/* نوع الإيجار */}
        <select className="border p-2 rounded" value={payload.rentalType ?? ""} onChange={e => update({ rentalType: e.target.value as any })}>
          <option value="">نوع الإيجار</option>
          <option value="daily">يومي</option>
          <option value="monthly">شهري</option>
          <option value="yearly">سنوي</option>
        </select>

        {/* المحافظة */}
        <select className="border p-2 rounded" value={payload.province ?? ""} onChange={e => update({ province: e.target.value, state: "", village: "" })}>
          <option value="">المحافظة</option>
          {provinces.map(p => <option key={p.name} value={p.name}>{p.name}</option>)}
        </select>

        {/* الولاية */}
        <select className="border p-2 rounded" value={payload.state ?? ""} onChange={e => update({ state: e.target.value, village: "" })}>
          <option value="">الولاية</option>
          {states.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
        </select>

        {/* القرية */}
        <select className="border p-2 rounded" value={payload.village ?? ""} onChange={e => update({ village: e.target.value })}>
          <option value="">القرية</option>
          {villages.map(v => <option key={v} value={v}>{v}</option>)}
        </select>
      </div>

      {/* الكلمات المفتاحية + زر البحث */}
      <div className="mt-2 grid grid-cols-1 md:grid-cols-6 gap-2 items-start">
        <div className="md:col-span-5 relative" ref={kwRef}>
          <input
            className="border p-2 rounded w-full"
            placeholder="كلمة مفتاحية…"
            value={payload.keyword ?? ""}
            onChange={e => onKwChange(e.target.value)}
          />
          {suggestions.length > 0 && (
            <ul className="absolute bg-white border rounded-lg mt-1 w-full max-h-48 overflow-auto z-20">
              {suggestions.map((s, i) => (
                <li key={i} className="px-3 py-2 hover:bg-gray-100 cursor-pointer" onClick={() => update({ keyword: s })}>
                  {s}
                </li>
              ))}
            </ul>
          )}
        </div>

        <button
          onClick={handleSearch}
          className="inline-flex items-center justify-center gap-2 bg-[var(--brand-600)] text-white px-4 py-2 rounded hover:bg-[var(--brand-700)]"
        >
          <FaSearch /> ابدأ البحث
        </button>
      </div>

      {/* زر عرض الفلاتر تحت الشريط (كما طلبت) */}
      {showFiltersButton && (
        <div className="mt-3 text-center">
          <button
            onClick={onOpenFilters}
            className="underline text-[var(--brand-700)] hover:opacity-80"
          >
            عرض الفلاتر
          </button>
        </div>
      )}
    </div>
  );
}
