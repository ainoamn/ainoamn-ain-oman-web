// src/components/search/UnifiedSearchBar.tsx
import { useMemo, useState } from "react";
import { OMAN_PROVINCES, getStates, getVillages } from "../../lib/om-locations";

type Props = {
  onSearch: (q: {
    keyword: string;
    type?: string; purpose?: string; rentalType?: string;
    province?: string; state?: string; village?: string;
  }) => void;
  initial?: Partial<{
    keyword: string; type: string; purpose: string; rentalType: string;
    province: string; state: string; village: string;
  }>;
};
function UnifiedSearchBar({ onSearch, initial }: Props) {
  const [keyword, setKeyword] = useState(initial?.keyword ?? "");
  const [type, setType] = useState(initial?.type ?? "");
  const [purpose, setPurpose] = useState(initial?.purpose ?? "");
  const [rentalType, setRentalType] = useState(initial?.rentalType ?? "");
  const [province, setProvince] = useState(initial?.province ?? "");
  const [state, setState] = useState(initial?.state ?? "");
  const [village, setVillage] = useState(initial?.village ?? "");

  const states = useMemo(() => getStates(province), [province]);
  const villages = useMemo(() => getVillages(province, state), [province, state]);

  return (
    <div className="rounded-xl border bg-white/80 backdrop-blur p-3 shadow-sm">
      <div className="grid md:grid-cols-6 gap-2">
        <input className="border rounded p-2 md:col-span-2" placeholder="كلمة مفتاحية…" value={keyword} onChange={e=>setKeyword(e.target.value)} />
        <select className="border rounded p-2" value={type} onChange={e=>setType(e.target.value)}>
          <option value="">نوع العقار</option>
          <option value="apartment">شقة</option><option value="villa">فيلا</option>
          <option value="land">أرض</option><option value="office">مكتب</option><option value="shop">محل</option>
        </select>
        <select className="border rounded p-2" value={purpose} onChange={e=>setPurpose(e.target.value)}>
          <option value="">الغرض</option>
          <option value="sale">بيع</option><option value="rent">إيجار</option><option value="investment">استثمار</option>
        </select>
        <select className="border rounded p-2" value={rentalType} onChange={e=>setRentalType(e.target.value)} disabled={purpose!=="rent"}>
          <option value="">نوع الإيجار</option>
          <option value="daily">يومي</option><option value="monthly">شهري</option><option value="yearly">سنوي</option>
        </select>
        <select className="border rounded p-2" value={province} onChange={e=>setProvince(e.target.value)}>
          <option value="">المحافظة</option>
          {OMAN_PROVINCES.map(p => <option key={p.name} value={p.name}>{p.name}</option>)}
        </select>
        <select className="border rounded p-2" value={state} onChange={e=>setState(e.target.value)} disabled={!province}>
          <option value="">الولاية</option>
          {states.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select className="border rounded p-2" value={village} onChange={e=>setVillage(e.target.value)} disabled={!state}>
          <option value="">القرية</option>
          {villages.map(v => <option key={v} value={v}>{v}</option>)}
        </select>

        <button
          onClick={() => onSearch({ keyword, type: type||undefined, purpose: purpose||undefined, rentalType: rentalType||undefined, province: province||undefined, state: state||undefined, village: village||undefined })}
          className="md:col-span-6 mt-1 px-4 py-2 rounded bg-[var(--brand-800)] hover:bg-[var(--brand-700)] text-white"
        >
          ابدأ البحث
        </button>
      </div>
    </div>
  );
}
