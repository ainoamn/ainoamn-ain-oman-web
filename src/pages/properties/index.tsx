// src/pages/properties/index.tsx
import Head from "next/head";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import Layout from "../../components/layout/Layout";
import { useCurrency } from "../../context/CurrencyContext";
import { getStates, getVillages, OMAN_PROVINCES } from "../../lib/om-locations";
import { FaFilter, FaBolt, FaBed, FaBath, FaRulerCombined, FaStar } from "react-icons/fa";
import UnifiedSearchBar from "../../components/search/UnifiedSearchBar";

type Item = {
  id: number | string;
  title: string;
  image: string;
  priceOMR: number;
  province: string;
  state: string;
  village?: string | null;
  location?: string;
  rating?: number;
  beds?: number;
  baths?: number;
  area?: number;
  type?: "apartment" | "villa" | "land" | "office" | "shop";
  purpose?: "sale" | "rent" | "investment";
  rentalType?: "daily" | "monthly" | "yearly" | null;
  promoted?: boolean;
  promotedAt?: string | null;
  createdAt?: string | null;
  amenities?: string[];
  /** ✅ رقم السيريال المرجعي */
  referenceNo?: string;
};

const ALL_TYPES = ["apartment", "villa", "land", "office", "shop"] as const;
const ALL_AMENITIES = [
  "مصعد",
  "مواقف",
  "تكييف مركزي",
  "مفروش",
  "مسبح",
  "حديقة",
  "مطبخ مجهز",
  "أمن 24/7",
  "كاميرات",
  "إنترنت عالي السرعة",
];
const STAR_OPTIONS = [5, 4, 3, 2, 1];
const LS_KEY = "ao_prop_filters_v2";

function useMounted() {
  const [m, setM] = useState(false);
  useEffect(() => {
    setM(true);
  }, []);
  return m;
}

export default function PropertiesIndexPage() {
  const mounted = useMounted();
  const { format } = useCurrency();

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<Item[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [q, setQ] = useState("");
  const [type, setType] = useState<Item["type"] | "">("");
  const [purpose, setPurpose] = useState<Item["purpose"] | "">("");
  const [rentalType, setRentalType] = useState<Item["rentalType"] | "">("");
  const [province, setProvince] = useState("");
  const [state, setState] = useState("");
  const [village, setVillage] = useState("");
  const [minPrice, setMinPrice] = useState<number | "">("");
  const [maxPrice, setMaxPrice] = useState<number | "">("");
  const [minArea, setMinArea] = useState<number | "">("");
  const [maxArea, setMaxArea] = useState<number | "">("");
  const [starSet, setStarSet] = useState<number[]>([]);
  const [amenitySet, setAmenitySet] = useState<string[]>([]);
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    try {
      const s = JSON.parse(localStorage.getItem(LS_KEY) || "null");
      if (s) {
        setQ(s.q ?? "");
        setType(s.type ?? "");
        setPurpose(s.purpose ?? "");
        setRentalType(s.rentalType ?? "");
        setProvince(s.province ?? "");
        setState(s.state ?? "");
        setVillage(s.village ?? "");
        setMinPrice(s.minPrice ?? "");
        setMaxPrice(s.maxPrice ?? "");
        setMinArea(s.minArea ?? "");
        setMaxArea(s.maxArea ?? "");
        setStarSet(s.starSet ?? []);
        setAmenitySet(s.amenitySet ?? []);
      }
    } catch {}
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem(
        LS_KEY,
        JSON.stringify({
          q,
          type,
          purpose,
          rentalType,
          province,
          state,
          village,
          minPrice,
          maxPrice,
          minArea,
          maxArea,
          starSet,
          amenitySet,
        })
      );
    } catch {}
  }, [q, type, purpose, rentalType, province, state, village, minPrice, maxPrice, minArea, maxArea, starSet, amenitySet]);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch("/api/properties")
      .then((r) => r.json())
      .then((d) => setItems(Array.isArray(d?.items) ? d.items : []))
      .catch(() => setError("تعذر جلب البيانات"))
      .finally(() => setLoading(false));
  }, []);

  const states = useMemo(() => getStates(province), [province]);
  const villages = useMemo(() => getVillages(province, state), [province, state]);
  useEffect(() => {
    setState("");
    setVillage("");
  }, [province]);
  useEffect(() => {
    setVillage("");
  }, [state]);

  const onSearch = (s: {
    keyword: string;
    type?: string;
    purpose?: string;
    rentalType?: string;
    province?: string;
    state?: string;
    village?: string;
  }) => {
    setQ(s.keyword || "");
    setType((s.type as any) || "");
    setPurpose((s.purpose as any) || "");
    setRentalType((s.rentalType as any) || "");
    setProvince(s.province || "");
    setState(s.state || "");
    setVillage(s.village || "");
  };

  /** نسخ الرقم المرجعي دون الانتقال لصفحة التفاصيل */
  const copyRef = (e: React.MouseEvent, ref?: string) => {
    if (!ref) return;
    e.preventDefault();
    e.stopPropagation();
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(ref).then(
        () => alert(`تم نسخ الرقم المرجعي: ${ref}`),
        () => alert(ref)
      );
    } else {
      alert(ref);
    }
  };

  const filtered = useMemo(() => {
    let list = [...items];
    const qq = q.trim().toLowerCase();
    if (qq)
      list = list.filter((p) => {
        const t = (p.title ?? "").toLowerCase();
        const loc = (p.location ?? "").toLowerCase();
        const pr = (p.province ?? "").toLowerCase();
        const st = (p.state ?? "").toLowerCase();
        const vg = (p.village ?? "").toLowerCase();
        const ref = (p.referenceNo ?? "").toLowerCase(); // ✅ البحث بالسيريال
        return t.includes(qq) || loc.includes(qq) || pr.includes(qq) || st.includes(qq) || vg.includes(qq) || ref.includes(qq);
      });
    if (type) list = list.filter((p) => p.type === type);
    if (purpose) list = list.filter((p) => p.purpose === purpose);
    if (rentalType) list = list.filter((p) => p.rentalType === rentalType);
    if (province) list = list.filter((p) => p.province === province);
    if (state) list = list.filter((p) => p.state === state);
    if (village) list = list.filter((p) => p.village === village);
    if (minPrice !== "") list = list.filter((p) => (p.priceOMR ?? 0) >= Number(minPrice));
    if (maxPrice !== "") list = list.filter((p) => (p.priceOMR ?? 0) <= Number(maxPrice));
    if (minArea !== "") list = list.filter((p) => (p.area ?? 0) >= Number(minArea));
    if (maxArea !== "") list = list.filter((p) => (p.area ?? 0) <= Number(maxArea));
    if (starSet.length) list = list.filter((p) => starSet.some((s) => Math.round(p.rating ?? 0) >= s));
    if (amenitySet.length) list = list.filter((p) => amenitySet.every((x) => (p.amenities ?? []).includes(x)));

    list.sort((a, b) => {
      const ap = a.promoted ? 1 : 0,
        bp = b.promoted ? 1 : 0;
      if (ap !== bp) return bp - ap;
      const apAt = a.promotedAt ? new Date(a.promotedAt).getTime() : 0;
      const bpAt = b.promotedAt ? new Date(b.promotedAt).getTime() : 0;
      if (apAt !== bpAt) return bpAt - apAt;
      const ac = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bc = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      if (ac !== bc) return bc - ac;
      const ar = a.rating ?? 0,
        br = b.rating ?? 0;
      if (ar !== br) return br - ar;
      return (b.priceOMR ?? 0) - (a.priceOMR ?? 0);
    });
    return list;
  }, [
    items,
    q,
    type,
    purpose,
    rentalType,
    province,
    state,
    village,
    minPrice,
    maxPrice,
    minArea,
    maxArea,
    starSet,
    amenitySet,
  ]);

  const amenityCounts = useMemo(() => {
    const base = [...items].filter((p) => {
      if (q.trim()) {
        const qq = q.trim().toLowerCase();
        const ok =
          (p.title ?? "").toLowerCase().includes(qq) ||
          (p.location ?? "").toLowerCase().includes(qq) ||
          (p.province ?? "").toLowerCase().includes(qq) ||
          (p.state ?? "").toLowerCase().includes(qq) ||
          (p.village ?? "").toLowerCase().includes(qq) ||
          (p.referenceNo ?? "").toLowerCase().includes(qq); // ✅ يدخل بالحسابات
        if (!ok) return false;
      }
      if (type && p.type !== type) return false;
      if (purpose && p.purpose !== purpose) return false;
      if (rentalType && p.rentalType !== rentalType) return false;
      if (province && p.province !== province) return false;
      if (state && p.state !== state) return false;
      if (village && p.village !== village) return false;
      if (minPrice !== "" && (p.priceOMR ?? 0) < Number(minPrice)) return false;
      if (maxPrice !== "" && (p.priceOMR ?? 0) > Number(maxPrice)) return false;
      if (minArea !== "" && (p.area ?? 0) < Number(minArea)) return false;
      if (maxArea !== "" && (p.area ?? 0) > Number(maxArea)) return false;
      if (starSet.length && !starSet.some((s) => Math.round(p.rating ?? 0) >= s)) return false;
      return true;
    });
    const m = new Map<string, number>();
    for (const a of ALL_AMENITIES) m.set(a, 0);
    for (const p of base) (p.amenities ?? []).forEach((a) => { if (m.has(a)) m.set(a, (m.get(a) ?? 0) + 1); });
    return m;
  }, [items, q, type, purpose, rentalType, province, state, village, minPrice, maxPrice, minArea, maxArea, starSet]);

  const resetAll = () => {
    setQ("");
    setType("");
    setPurpose("");
    setRentalType("");
    setProvince("");
    setState("");
    setVillage("");
    setMinPrice("");
    setMaxPrice("");
    setMinArea("");
    setMaxArea("");
    setStarSet([]);
    setAmenitySet([]);
  };

  return (
    <Layout>
      <Head>
        <title>العقارات | عين عُمان</title>
      </Head>

      <div className="flex items-center justify-between gap-2 mb-3">
        <h1 className="text-2xl font-bold">العقارات</h1>
        <Link href="/properties/new" className="px-4 py-2 rounded bg-[var(--brand-800)] hover:bg-[var(--brand-700)] text-white">
          نشر عقار جديد
        </Link>
      </div>

      <div className="mb-3">
        <UnifiedSearchBar
          onSearch={onSearch}
          initial={{ keyword: q, type, purpose, rentalType, province, state, village }}
        />
      </div>

      <div className="mb-2 lg:hidden">
        <button
          onClick={() => setFiltersOpen((v) => !v)}
          className="inline-flex items-center justify-center gap-2 px-3 py-2 border rounded"
        >
          <FaFilter /> {filtersOpen ? "إخفاء الفلاتر" : "عرض الفلاتر"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-4">
        <aside className={`${filtersOpen ? "block" : "hidden"} lg:block`}>
          <div className="border rounded-lg p-3 bg-white sticky top-16">
            <div className="flex items-center justify-between mb-2">
              <div className="font-semibold">الفلاتر</div>
              <button onClick={resetAll} className="text-xs underline text-red-600">
                إعادة تعيين الكل
              </button>
            </div>

            <div className="grid gap-3 text-sm">
              <div>
                <label className="block text-gray-600 mb-1">نوع العقار</label>
                <select className="w-full border rounded p-2" value={type} onChange={(e) => setType(e.target.value as any)}>
                  <option value="">الكل</option>
                  {ALL_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t === "apartment" ? "شقة" : t === "villa" ? "فيلا" : t === "land" ? "أرض" : t === "office" ? "مكتب" : "محل"}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-gray-600 mb-1">الغرض</label>
                  <select className="w-full border rounded p-2" value={purpose} onChange={(e) => setPurpose(e.target.value as any)}>
                    <option value="">الكل</option>
                    <option value="sale">بيع</option>
                    <option value="rent">إيجار</option>
                    <option value="investment">استثمار</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-600 mb-1">نوع الإيجار</label>
                  <select
                    className="w-full border rounded p-2"
                    value={rentalType}
                    onChange={(e) => setRentalType(e.target.value as any)}
                    disabled={purpose !== "rent"}
                  >
                    <option value="">—</option>
                    <option value="daily">يومي</option>
                    <option value="monthly">شهري</option>
                    <option value="yearly">سنوي</option>
                  </select>
                </div>
              </div>

              <div className="grid gap-2">
                <div>
                  <label className="block text-gray-600 mb-1">المحافظة</label>
                  <select className="w-full border rounded p-2" value={province} onChange={(e) => setProvince(e.target.value)}>
                    <option value="">الكل</option>
                    {OMAN_PROVINCES.map((p) => (
                      <option key={p.name} value={p.name}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-600 mb-1">الولاية</label>
                  <select
                    className="w-full border rounded p-2"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    disabled={!province}
                  >
                    <option value="">الكل</option>
                    {getStates(province).map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-600 mb-1">القرية</label>
                  <select
                    className="w-full border rounded p-2"
                    value={village}
                    onChange={(e) => setVillage(e.target.value)}
                    disabled={!state}
                  >
                    <option value="">الكل</option>
                    {getVillages(province, state).map((v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-gray-600 mb-1">السعر من</label>
                  <input
                    type="number"
                    className="w-full border rounded p-2"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value ? +e.target.value : "")}
                  />
                </div>
                <div>
                  <label className="block text-gray-600 mb-1">السعر إلى</label>
                  <input
                    type="number"
                    className="w-full border rounded p-2"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value ? +e.target.value : "")}
                  />
                </div>
                <div>
                  <label className="block text-gray-600 mb-1">المساحة من</label>
                  <input
                    type="number"
                    className="w-full border rounded p-2"
                    value={minArea}
                    onChange={(e) => setMinArea(e.target.value ? +e.target.value : "")}
                  />
                </div>
                <div>
                  <label className="block text-gray-600 mb-1">المساحة إلى</label>
                  <input
                    type="number"
                    className="w-full border rounded p-2"
                    value={maxArea}
                    onChange={(e) => setMaxArea(e.target.value ? +e.target.value : "")}
                  />
                </div>
              </div>

              <div>
                <div className="block text-gray-600 mb-1">الحد الأدنى للتقييم</div>
                <div className="flex flex-wrap gap-2">
                  {STAR_OPTIONS.map((s) => (
                    <label key={s} className="inline-flex items-center gap-1 border rounded px-2 py-1">
                      <input
                        type="checkbox"
                        checked={starSet.includes(s)}
                        onChange={(e) =>
                          setStarSet((prev) => (e.target.checked ? [...prev, s] : prev.filter((x) => x !== s)))
                        }
                      />
                      <span className="inline-flex items-center gap-1">
                        <FaStar className="text-yellow-500" /> {s}+
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <div className="block text-gray-600 mb-1">المرافق</div>
                <div className="flex flex-wrap gap-2">
                  {ALL_AMENITIES.map((a) => {
                    const c = amenityCounts.get(a) ?? 0;
                    const disabled = c === 0 && !amenitySet.includes(a);
                    return (
                      <label
                        key={a}
                        className={`inline-flex items-center gap-1 border rounded px-2 py-1 ${
                          disabled ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                      >
                        <input
                          type="checkbox"
                          disabled={disabled}
                          checked={amenitySet.includes(a)}
                          onChange={(e) =>
                            setAmenitySet((prev) => (e.target.checked ? [...prev, a] : prev.filter((x) => x !== a)))
                          }
                        />
                        <span>
                          {a} <span className="text-xs text-gray-500">({c})</span>
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </aside>

        <section>
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-gray-600">
              النتائج: <b>{filtered.length}</b>
            </div>
            <div className="text-sm">
              <span className="text-gray-600">الترتيب: </span>
              <span className="font-semibold">المميز أولًا، ثم الأحدث، ثم الأعلى تقييمًا</span>
            </div>
          </div>

          {loading && <div className="py-10 text-center text-gray-600">جاري التحميل…</div>}
          {error && <div className="py-10 text-center text-red-600">{error}</div>}
          {!loading && !error && filtered.length === 0 && (
            <div className="py-10 text-center text-gray-600">لا توجد نتائج مطابقة.</div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((p) => (
              <Link
                href={`/property/${p.id}`}
                key={String(p.id)}
                className="border rounded-lg overflow-hidden shadow hover:shadow-lg transition block"
              >
                <div className="relative">
                  <img src={p.image} alt={p.title} className="w-full h-48 object-cover" />
                  {/* ✅ شارة السيريال (نسخ عند الضغط) */}
                  {p.referenceNo && (
                    <button
                      onClick={(e) => copyRef(e, p.referenceNo)}
                      title="انسخ الرقم المرجعي"
                      className="absolute top-2 left-2 text-[10px] bg-black/70 hover:bg-black text-white px-2 py-1 rounded"
                    >
                      {p.referenceNo}
                    </button>
                  )}
                  {p.promoted && (
                    <span className="absolute top-2 end-2 text-xs bg-amber-500 text-white px-2 py-1 rounded inline-flex items-center gap-1">
                      <FaBolt /> مميز
                    </span>
                  )}
                </div>
                <div className="p-3">
                  <div className="font-semibold line-clamp-1">{p.title}</div>
                  <div className="text-xs text-gray-600 line-clamp-1">
                    {p.location ?? `${p.province} - ${p.state}${p.village ? " - " + p.village : ""}`}
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <div className="text-[var(--brand-700)] font-bold">
                      {mounted ? format(p.priceOMR ?? 0) : `${p.priceOMR ?? 0} ر.ع`}
                    </div>
                    <div className="text-xs text-yellow-600 inline-flex items-center gap-1">
                      <FaStar /> {p.rating ?? 0}
                    </div>
                  </div>
                  <div className="mt-2 grid grid-cols-3 gap-2 text-xs text-gray-700">
                    <div className="inline-flex items-center gap-1">
                      <FaBed /> {p.beds ?? 0}
                    </div>
                    <div className="inline-flex items-center gap-1">
                      <FaBath /> {p.baths ?? 0}
                    </div>
                    <div className="inline-flex items-center gap-1">
                      <FaRulerCombined /> {p.area ?? 0} م²
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </Layout>
  );
}
