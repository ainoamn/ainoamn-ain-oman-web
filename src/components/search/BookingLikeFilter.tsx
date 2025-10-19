// @ts-nocheck
// src/components/search/BookingLikeFilter.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import locationData from "../../lib/locationData";

type RentalType = "daily" | "monthly" | "yearly" | "";
type Purpose = "sale" | "rent" | "investment" | "";
type PropType = "apartment" | "villa" | "land" | "office" | "shop" | "";

export type BookingLikePayload = {
  // أساسي
  propertyType?: PropType;
  purpose?: Purpose;
  rentalType?: RentalType;

  // الموقع
  province?: string;
  state?: string;
  village?: string;
  keyword?: string;

  // التواريخ (تنفع لليومي)
  checkIn?: string;  // YYYY-MM-DD
  checkOut?: string;

  // السعر/المواصفات
  priceMin?: number;
  priceMax?: number;
  bedsMin?: number;
  bathsMin?: number;
  areaMin?: number;
  areaMax?: number;

  // إشغال (لليومي)
  rooms?: number;
  adults?: number;
  children?: number;

  // فرز
  sortBy?: "newest" | "priceAsc" | "priceDesc" | "rating" | "views";

  // وسوم سريعة
  tags?: string[]; // ["قريب من البحر", ...]
};

export default function BookingLikeFilter({
  onSearch,
  instant = false,
  defaultValues
}: {
  onSearch?: (payload: BookingLikePayload) => void;
  instant?: boolean;
  defaultValues?: Partial<BookingLikePayload>;
}) {
  const [payload, setPayload] = useState<BookingLikePayload>({
    propertyType: "",
    purpose: "",
    rentalType: "",
    province: "",
    state: "",
    village: "",
    keyword: "",
    checkIn: "",
    checkOut: "",
    priceMin: 0,
    priceMax: 500000,
    bedsMin: undefined,
    bathsMin: undefined,
    areaMin: undefined,
    areaMax: undefined,
    rooms: 1,
    adults: 2,
    children: 0,
    sortBy: undefined,
    tags: []
  });

  // فتح/إغلاق القوائم المنبثقة
  const [openGuests, setOpenGuests] = useState(false);
  const [openMoreFilters, setOpenMoreFilters] = useState(false);
  const guestsRef = useRef<HTMLDivElement>(null);
  const moreRef = useRef<HTMLDivElement>(null);

  // اقتراحات تلقائية للكلمة المفتاحية (وهمية الآن)
  const [suggestions, setSuggestions] = useState<string[]>([]);
  useEffect(() => {
    if (payload.keyword && payload.keyword.trim().length >= 2) {
      const k = payload.keyword.trim().toLowerCase();
      const pool = ["شقة", "فيلا", "مكتب", "بحري", "قريب من الخدمات", "الخوض", "المعبيلة", "القرم", "الوطية"];
      setSuggestions(pool.filter(x => x.includes(k)).slice(0, 6));
    } else {
      setSuggestions([]);
    }
  }, [payload.keyword]);

  // تحميل القيم الابتدائية
  useEffect(() => {
    if (defaultValues) {
      setPayload(prev => ({ ...prev, ...defaultValues }));
    }
  }, [defaultValues]);

  // إغلاق القوائم عند الضغط خارجها
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (guestsRef.current && !guestsRef.current.contains(e.target as Node)) setOpenGuests(false);
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) setOpenMoreFilters(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  // تحديث حالة
  const update = (p: Partial<BookingLikePayload>) => setPayload(prev => ({ ...prev, ...p }));

  const provinces = locationData.provinces;
  const states = useMemo(
    () => provinces.find(p => p.name === payload.province)?.states ?? [],
    [payload.province, provinces]
  );
  const villages = useMemo(
    () => states.find(s => s.name === payload.state)?.villages ?? [],
    [payload.state, states]
  );

  // تفعيل فوري
  useEffect(() => { if (instant && onSearch) onSearch(payload); }, [payload]); // eslint-disable-line

  // سلايدر السعر (مدى مزدوج بسيط)
  const [minTmp, setMinTmp] = useState<number>(payload.priceMin ?? 0);
  const [maxTmp, setMaxTmp] = useState<number>(payload.priceMax ?? 500000);
  useEffect(() => { setMinTmp(payload.priceMin ?? 0); setMaxTmp(payload.priceMax ?? 500000); }, []);

  const clampPrice = (v: number) => Math.max(0, Math.min(1000000, v));
  const commitPrice = () => update({ priceMin: clampPrice(minTmp), priceMax: clampPrice(maxTmp) });

  const TagChip = ({ label }: { label: string }) => {
    const active = payload.tags?.includes(label);
    return (
      <button
        type="button"
        onClick={() => {
          const set = new Set(payload.tags ?? []);
          active ? set.delete(label) : set.add(label);
          update({ tags: Array.from(set) });
        }}
        className={`px-3 py-1 rounded-full text-sm border transition ${
          active ? "bg-[var(--brand-600)] text-white border-transparent" : "hover:bg-gray-100"
        }`}
      >
        {label}
      </button>
    );
  };

  const handleSearchClick = () => onSearch?.(payload);

  return (
    <div className="bg-white rounded-xl shadow-lg p-3 md:p-4 sticky top-2 z-30">
      {/* الصف الأعلى: الوجهة والكلمة المفتاحية + الموقع الهرمي */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
        {/* كلمة مفتاحية مع اقتراحات */}
        <div className="md:col-span-3 relative">
          <input
            className="w-full border rounded-lg p-2"
            placeholder="ابحث: مدينة، حي، كلمة مفتاحية…"
            value={payload.keyword ?? ""}
            onChange={e => update({ keyword: e.target.value })}
          />
          {suggestions.length > 0 && (
            <ul className="absolute bg-white border rounded-lg mt-1 w-full max-h-48 overflow-auto z-20">
              {suggestions.map((s, i) => (
                <li
                  key={i}
                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => update({ keyword: s })}
                >
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

        {/* القرية */}
        <div className="md:col-span-3">
          <select
            className="w-full border rounded-lg p-2"
            value={payload.village ?? ""}
            onChange={e => update({ village: e.target.value })}
          >
            <option value="">القرية</option>
            {villages.map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>
      </div>

      {/* الصف الثاني: نوع/غرض/إيجار + تواريخ + ضيوف/غرف */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-2 mt-2">
        {/* نوع العقار */}
        <div className="md:col-span-2">
          <select
            className="w-full border rounded-lg p-2"
            value={payload.propertyType ?? ""}
            onChange={e => update({ propertyType: e.target.value as PropType })}
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
            onChange={e => update({ purpose: e.target.value as Purpose })}
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
            onChange={e => update({ rentalType: e.target.value as RentalType })}
          >
            <option value="">نوع الإيجار</option>
            <option value="daily">يومي</option>
            <option value="monthly">شهري</option>
            <option value="yearly">سنوي</option>
          </select>
        </div>

        {/* التواريخ (لليومي فقط) */}
        {payload.rentalType === "daily" ? (
          <>
            <div className="md:col-span-2">
              <input
                type="date"
                className="w-full border rounded-lg p-2"
                value={payload.checkIn ?? ""}
                onChange={e => update({ checkIn: e.target.value })}
              />
            </div>
            <div className="md:col-span-2">
              <input
                type="date"
                className="w-full border rounded-lg p-2"
                value={payload.checkOut ?? ""}
                onChange={e => update({ checkOut: e.target.value })}
              />
            </div>
          </>
        ) : (
          <div className="md:col-span-4 flex items-center justify-center text-sm text-gray-500 border rounded-lg">
            اختر "يومي" لإظهار التواريخ
          </div>
        )}

        {/* الضيوف/الغرف (لليومي) */}
        <div className="md:col-span-2 relative" ref={guestsRef}>
          <button
            type="button"
            onClick={() => setOpenGuests(v => !v)}
            className="w-full border rounded-lg p-2 text-start"
          >
            الضيوف/الغرف: {payload.adults ?? 0} بالغ · {payload.children ?? 0} طفل · {payload.rooms ?? 1} غرفة
          </button>
          {openGuests && (
            <div className="absolute bg-white border rounded-lg shadow p-3 mt-1 w-full z-20">
              <RowCounter label="البالغون" value={payload.adults ?? 0} onChange={v => update({ adults: v })} min={1} />
              <RowCounter label="الأطفال" value={payload.children ?? 0} onChange={v => update({ children: v })} min={0} />
              <RowCounter label="الغرف" value={payload.rooms ?? 1} onChange={v => update({ rooms: v })} min={1} />
            </div>
          )}
        </div>
      </div>

      {/* الصف الثالث: السعر/المساحة/غرف/حمامات (سريع) + الفرز + المزيد */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-2 mt-2">
        {/* سلايدر السعر */}
        <div className="md:col-span-4">
          <div className="border rounded-lg p-2">
            <div className="text-xs text-gray-500 mb-1">السعر (ر.ع)</div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                className="border rounded p-1 w-24"
                value={minTmp}
                onChange={e => setMinTmp(+e.target.value || 0)}
                onBlur={commitPrice}
              />
              <div className="flex-1 px-2">
                {/* سلايدر مزدوج بسيط */}
                <div className="relative h-8">
                  <input type="range" min={0} max={1000000} value={minTmp} onChange={e => setMinTmp(+e.target.value)} className="absolute inset-0 w-full opacity-70" />
                  <input type="range" min={0} max={1000000} value={Math.max(maxTmp, minTmp)} onChange={e => setMaxTmp(+e.target.value)} onMouseUp={commitPrice} onTouchEnd={commitPrice} className="absolute inset-0 w-full opacity-70" />
                </div>
              </div>
              <input
                type="number"
                className="border rounded p-1 w-24"
                value={maxTmp}
                onChange={e => setMaxTmp(+e.target.value || 0)}
                onBlur={commitPrice}
              />
            </div>
          </div>
        </div>

        {/* غرف/حمامات */}
        <div className="md:col-span-3 grid grid-cols-2 gap-2">
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
        <div className="md:col-span-3 grid grid-cols-2 gap-2">
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
          <select className="w-full border rounded-lg p-2" value={payload.sortBy ?? ""} onChange={e => update({ sortBy: e.target.value as any })}>
            <option value="">الفرز حسب</option>
            <option value="newest">الأحدث</option>
            <option value="priceAsc">السعر ↑</option>
            <option value="priceDesc">السعر ↓</option>
            <option value="rating">التقييم</option>
            <option value="views">المشاهدة</option>
          </select>
        </div>

        {/* المزيد من الفلاتر */}
        <div className="md:col-span-12 flex items-center gap-2 justify-between">
          <div className="flex flex-wrap gap-2 mt-2">
            <span className="text-xs text-gray-500 me-2">وسوم سريعة:</span>
            {["قريب من البحر", "حديث البناء", "مفروش", "مواقف متاحة", "بالقرب من المدارس"].map((t) => (
              <TagChip key={t} label={t} />
            ))}
          </div>

          {/* زر البحث */}
          {!instant && (
            <button
              onClick={handleSearchClick}
              className="mt-2 inline-flex items-center gap-2 bg-[var(--brand-600)] text-white px-5 py-2 rounded-lg hover:bg-[var(--brand-700)]"
            >
              بحث متقدم
            </button>
          )}

          {/* زر المزيد */}
          <button
            type="button"
            className="mt-2 underline text-[var(--brand-700)] hover:opacity-80"
            onClick={() => setOpenMoreFilters(true)}
          >
            المزيد من الفلاتر
          </button>
        </div>
      </div>

      {/* مودال المزيد من الفلاتر */}
      {openMoreFilters && (
        <div className="fixed inset-0 z-40 flex items-end md:items-center justify-center bg-black/40">
          <div ref={moreRef} className="bg-white rounded-t-2xl md:rounded-2xl w-full md:max-w-3xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold">المزيد من الفلاتر</h3>
              <button onClick={() => setOpenMoreFilters(false)} className="text-red-600">إغلاق</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* أمثلة لفلاتر إضافية قابلة للتوسّع لاحقاً */}
              <label className="flex items-center gap-2">
                <input type="checkbox"
                  checked={payload.tags?.includes("حارس أمن")}
                  onChange={(e) => {
                    const set = new Set(payload.tags ?? []);
                    e.target.checked ? set.add("حارس أمن") : set.delete("حارس أمن");
                    update({ tags: Array.from(set) });
                  }}
                />
                حارس أمن
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox"
                  checked={payload.tags?.includes("نظام سمارت")}
                  onChange={(e) => {
                    const set = new Set(payload.tags ?? []);
                    e.target.checked ? set.add("نظام سمارت") : set.delete("نظام سمارت");
                    update({ tags: Array.from(set) });
                  }}
                />
                نظام سمارت
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox"
                  checked={payload.tags?.includes("مسموح بالحيوانات")}
                  onChange={(e) => {
                    const set = new Set(payload.tags ?? []);
                    e.target.checked ? set.add("مسموح بالحيوانات") : set.delete("مسموح بالحيوانات");
                    update({ tags: Array.from(set) });
                  }}
                />
                مسموح بالحيوانات
              </label>
            </div>

            <div className="mt-4 flex items-center justify-end gap-2">
              <button className="px-4 py-2 rounded border" onClick={() => setOpenMoreFilters(false)}>إلغاء</button>
              <button
                className="px-5 py-2 rounded bg-[var(--brand-600)] text-white hover:bg-[var(--brand-700)]"
                onClick={() => { onSearch?.(payload); setOpenMoreFilters(false); }}
              >
                تطبيق الفلاتر
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function RowCounter({ label, value, onChange, min = 0, max = 20 }: { label: string; value: number; onChange: (v: number) => void; min?: number; max?: number; }) {
  return (
    <div className="flex items-center justify-between py-1">
      <div>{label}</div>
      <div className="flex items-center gap-2">
        <button className="w-8 h-8 rounded-full border hover:bg-gray-100" onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min}>−</button>
        <div className="w-6 text-center">{value}</div>
        <button className="w-8 h-8 rounded-full border hover:bg-gray-100" onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max}>+</button>
      </div>
    </div>
  );
}
