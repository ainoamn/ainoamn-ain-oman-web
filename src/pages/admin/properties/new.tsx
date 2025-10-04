// src/pages/admin/properties/new.tsx
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";

type Unit = { id: string; unitNo: string; status: string; images: string[]; rentAmount?: number; currency?: string; published?: boolean };
type Building = {
  id?: string;
  buildingNo?: string;
  address: string;
  images?: string[];
  coverIndex?: number;
  published?: boolean;
  units: Unit[];
};

export default function NewPropertyPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [units, setUnits] = useState<Unit[]>([]);
  const [busy, setBusy] = useState(false);

  const addUnit = () => setUnits(prev => [...prev, { id: String(Date.now()), unitNo: "", status: "vacant", images: [], rentAmount: 0, currency: "OMR", published: true }]);
  const removeUnit = (i: number) => setUnits(prev => prev.filter((_, idx) => idx !== i));
  const patchUnit = (i: number, key: keyof Unit, val: any) => setUnits(prev => prev.map((u, idx) => idx === i ? { ...u, [key]: val } : u));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const payload: Building = {
        buildingNo: name || undefined,
        address,
        published: true,
        units: units.map(u => ({ ...u, rentAmount: Number(u.rentAmount || 0) })),
      };
      const r = await fetch("/api/buildings", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
      if (!r.ok) throw new Error("فشل حفظ المبنى");
      // بعد الحفظ، العقارات الخاصة بالوحدات تُنشأ تلقائياً وتظهر في الواجهة
      router.push("/admin/properties");
    } catch (e:any) {
      alert(e?.message || "تعذّر الحفظ");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Head><title>إضافة عقار جديد</title></Head>
      <div className="flex min-h-screen flex-col items-center justify-start p-4 bg-gray-100">
        <div className="w-full max-w-4xl bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-center mb-6">إضافة مبنى + وحداته</h1>

          <form onSubmit={onSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold mb-1">اسم/رقم المبنى</label>
                <input className="w-full p-2 border rounded" value={name} onChange={e=>setName(e.target.value)} required />
              </div>
              <div>
                <label className="block font-semibold mb-1">العنوان</label>
                <input className="w-full p-2 border rounded" value={address} onChange={e=>setAddress(e.target.value)} required />
              </div>
            </div>

            <section>
              <h2 className="text-xl font-bold mb-3">الوحدات</h2>
              {units.map((u, i) => (
                <div key={u.id} className="bg-gray-50 border rounded p-3 mb-3">
                  <div className="grid md:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-sm">رقم الوحدة</label>
                      <input className="w-full p-2 border rounded" value={u.unitNo} onChange={e=>patchUnit(i,"unitNo",e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-sm">الإيجار الشهري</label>
                      <input type="number" className="w-full p-2 border rounded" value={u.rentAmount || 0} onChange={e=>patchUnit(i,"rentAmount",Number(e.target.value))} />
                    </div>
                    <div>
                      <label className="block text-sm">الحالة</label>
                      <select className="w-full p-2 border rounded" value={u.status} onChange={e=>patchUnit(i,"status",e.target.value)}>
                        <option value="vacant">شاغر</option>
                        <option value="reserved">محجوز</option>
                        <option value="leased">مؤجّر</option>
                      </select>
                    </div>
                    <div className="flex items-end">
                      <label className="inline-flex items-center gap-2 text-sm">
                        <input type="checkbox" checked={!!u.published} onChange={e=>patchUnit(i,"published",e.target.checked)} />
                        نشر الوحدة
                      </label>
                    </div>
                  </div>
                  <button type="button" className="mt-3 text-sm text-red-700" onClick={()=>removeUnit(i)}>حذف الوحدة</button>
                </div>
              ))}
              <button type="button" className="w-full rounded bg-green-600 text-white py-2" onClick={addUnit}>إضافة وحدة</button>
            </section>

            <div className="flex justify-end gap-3">
              <Link href="/admin/properties" className="px-4 py-2 rounded bg-gray-200">إلغاء</Link>
              <button disabled={busy} className="px-4 py-2 rounded bg-blue-600 text-white">{busy? "جارٍ الحفظ…" : "حفظ"}</button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
