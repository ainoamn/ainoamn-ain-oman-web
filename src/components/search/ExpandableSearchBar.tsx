// src/components/search/ExpandableSearchBar.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import locationData from "../../lib/locationData";
import { FaSearch, FaChevronDown } from "react-icons/fa";

export type ExpandableSearchPayload = {
  // أساسي
  propertyType?: "apartment" | "villa" | "land" | "office" | "shop" | "";
  purpose?: "sale" | "rent" | "investment" | "";
  rentalType?: "daily" | "monthly" | "yearly" | "";

  // الموقع
  province?: string;
  state?: string;
  village?: string;
  keyword?: string;

  // فلاتر متقدمة
  priceMin?: number;
  priceMax?: number;
  bedsMin?: number;
  bathsMin?: number;
  areaMin?: number;
  areaMax?: number;

  sortBy?: "newest" | "priceAsc" | "priceDesc" | "rating" | "views";
};

export default function ExpandableSearchBar({
  onSearch,
  instant = false,
  defaultValues
}: {
  onSearch?: (payload: ExpandableSearchPayload) => void;
  instant?: boolean;            // يفعل البحث مباشرة عند أي تغيير
  defaultValues?: Partial<ExpandableSearchPayload>;
}) {
  const [openMore, setOpenMore] = useState(false);
  const [payload, setPayload] = useState<ExpandableSearchPayload>({
    propertyType: "",
    purpose: "",
    rentalType: "",
    province: "",
    state: "",
    village: "",
    keyword: "",
    priceMin: undefined,
    priceMax: undefined,
    bedsMin: undefined,
    bathsMin: undefined,
    areaMin: undefined,
    areaMax: undefined,
    sortBy: ""
  });

  // تحميل قيم افتراضية (إن وجدت)
  useEffect(() => {
    if (defaultValues) setPayload(prev => ({ ...prev, ...defaultValues }));
  }, [defaultValues]);

  const update = (p: Partial<ExpandableSearchPayload>) => setPayload(prev => ({ ...prev, ...p }));

  // اقتراحات للكلمة المفتاحية (بسيطة الآن)
  const [suggestions, setSuggestions] = useState<string[]>([]);
  useEffect(() => {
    const k = (payload.keyword || "").trim().toLowerCase();
    if (k.length >= 2) {
      const pool = ["شقة", "فيلا", "أرض", "مكتب", "محل", "الخوير", "المعبيلة", "القرم", "صلالة", "نزوى"];
      setSuggestions(pool.filter(x => x.includes(k)).slice(0, 6));
    } else {
      setSuggestions([]);
    }
  }, [payload.keyword]);

  // مناطق
  const provinces = locationData.provinces;
  const states = useMemo(
    () => provinces.find(p => p.name === payload.province)?.states ?? [],
    [payload.province, provinces]
  );
  const villages = useMemo(
    () => states.find(s => s.name === payload.state)?.villages ?? [],
    [payload.state, states]
  );

  // إغلاق قائمة الاقتراحات عند الضغط خارج حقل البحث
  const kwRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (kwRef.current && !kwRef.current.contains(e.target as Node)) setSuggestions([]);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  // بحث فوري
  useEffect(() => {
    if (instant && onSearch) onSearch(payload);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [payload]);

  const handleSearch = () => onSearch?.(payload);

  // صف شريط البحث المضغوط
  return (
    <div className="bg-white rounded-xl shadow-lg p-3">
      {/* الشريط المضغوط */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
        {/* الكلمة المفتاحية */}
        <div className="md:col-span-4 relative" ref={kwRef}>
          <input
            className="w-full border rounded-lg p-2"
            placeholder="كلمة مفتاحية: مدينة، حي، وصف…"
            value={payload.keyword ?? ""}
            onChange={e => update({ keyword: e.target.value })}
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

        {/* المحافظة */}
        <div className="md:col-span-3">
          <select
            className="w-full border rounded-lg p-2"
            value={payload.province ?? ""}
            onChange={e => update({ province: e.target.value, state: "", village: "" })}
          >
            <option value="">المحافظة</option>
            {provinces.map(p => <option key={p.name} value={p.name}>{p.name}</option>)}
          </select>
        </div>

        {/* الولاية */}
        <div className="md:col-span-3">
          <select
            className="w-full border rounded-lg p-2"
            value={payload.state ?? ""}
            onChange={e => update({ state: e.target.value, village: "" })}
          >
            <option value="">الولاية</option>
            {states.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
          </select>
        </div>

        {/* زر البحث + المزيد */}
        <div className="md:col-span-2 flex gap-2">
          <button
            onClick={handleSearch}
            className="flex-1 inline-flex items-center justify-center gap-2 bg-[var(--brand-600)] text-white px-4 py-2 rounded-lg hover:bg-[var(--brand-700)]"
          >
            <FaSearch /> ابدأ البحث
          </button>
          <button
            type="button"
            onClick={() => setOpenMore(v => !v)}
            className="inline-flex items-center justify-center gap-1 border px-3 rounded-lg hover:bg-gray-50"
            aria-expanded={openMore}
          >
            المزيد <FaChevronDown className={`transition ${openMore ? "rotate-180" : ""}`} />
          </button>
        </div>
      </div>

      {/* لوحة الفلاتر الموسّعة */}
      {openMore && (
        <div className="mt-3 border-t pt-3 grid grid-cols-1 md:grid-cols-12 gap-2">
          {/* نوع العقار */}
          <div className="md:col-span-2">
            <select
              className="w-full border rounded-lg p-2"
              value={payload.propertyType ?? ""}
              onChange={e => update({ propertyType: e.target.value as any })}
            >
              <option value="">نوع العقار</option>
              <option value="apartment">شقة</option>
              <option value="villa">فيلا</option>
              <option value="land">أرض</option>
              <option value="office">مكتب</option>
              <option value="shop">محل تجاري</option>
            </select>
          </div>

          {/* الغرض */}
          <div className="md:col-span-2">
            <select
              className="w-full border rounded-lg p-2"
              value={payload.purpose ?? ""}
              onChange={e => update({ purpose: e.target.value as any })}
            >
              <option value="">الغرض</option>
              <option value="sale">للبيع</option>
              <option value="rent">للإيجار</option>
              <option value="investment">استثمار</option>
            </select>
          </div>

          {/* نوع الإيجار */}
          <div className="md:col-span-2">
            <select
              className="w-full border rounded-lg p-2"
              value={payload.rentalType ?? ""}
              onChange={e => update({ rentalType: e.target.value as any })}
            >
              <option value="">نوع الإيجار</option>
              <option value="daily">يومي</option>
              <option value="monthly">شهري</option>
              <option value="yearly">سنوي</option>
            </select>
          </div>

          {/* القرية */}
          <div className="md:col-span-2">
            <select
              className="w-full border rounded-lg p-2"
              value={payload.village ?? ""}
              onChange={e => update({ village: e.target.value })}
            >
              <option value="">القرية</option>
              {villages.map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>

          {/* السعر من/إلى */}
          <div className="md:col-span-2 grid grid-cols-2 gap-2">
            <input
              type="number" className="border rounded-lg p-2" placeholder="السعر من"
              value={payload.priceMin ?? ""} onChange={e => update({ priceMin: e.target.value ? +e.target.value : undefined })}
            />
            <input
              type="number" className="border rounded-lg p-2" placeholder="السعر إلى"
              value={payload.priceMax ?? ""} onChange={e => update({ priceMax: e.target.value ? +e.target.value : undefined })}
            />
          </div>

          {/* غرف/حمامات */}
          <div className="md:col-span-2 grid grid-cols-2 gap-2">
            <input
              type="number" className="border rounded-lg p-2" placeholder="غرف (≥)"
              value={payload.bedsMin ?? ""} onChange={e => update({ bedsMin: e.target.value ? +e.target.value : undefined })}
            />
            <input
              type="number" className="border rounded-lg p-2" placeholder="حمامات (≥)"
              value={payload.bathsMin ?? ""} onChange={e => update({ bathsMin: e.target.value ? +e.target.value : undefined })}
            />
          </div>

          {/* المساحة */}
          <div className="md:col-span-2 grid grid-cols-2 gap-2">
            <input
              type="number" className="border rounded-lg p-2" placeholder="المساحة من"
              value={payload.areaMin ?? ""} onChange={e => update({ areaMin: e.target.value ? +e.target.value : undefined })}
            />
            <input
              type="number" className="border rounded-lg p-2" placeholder="المساحة إلى"
              value={payload.areaMax ?? ""} onChange={e => update({ areaMax: e.target.value ? +e.target.value : undefined })}
            />
          </div>

          {/* الفرز */}
          <div className="md:col-span-2">
            <select
              className="w-full border rounded-lg p-2"
              value={payload.sortBy ?? ""}
              onChange={e => update({ sortBy: e.target.value as any })}
            >
              <option value="">الفرز حسب</option>
              <option value="newest">الأحدث</option>
              <option value="priceAsc">السعر ↑</option>
              <option value="priceDesc">السعر ↓</option>
              <option value="rating">التقييم</option>
              <option value="views">المشاهدة</option>
            </select>
          </div>

          {/* زر تطبيق (داخل اللوحة الموسعة لراحة المستخدم) */}
          <div className="md:col-span-2 flex items-center justify-end">
            <button
              onClick={handleSearch}
              className="inline-flex items-center gap-2 bg-[var(--brand-600)] text-white px-4 py-2 rounded-lg hover:bg-[var(--brand-700)]"
            >
              <FaSearch /> تطبيق الفلاتر
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
