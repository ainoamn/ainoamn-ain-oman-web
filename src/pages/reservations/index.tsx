// src/pages/reservations/index.tsx
// إصلاح items.map: تطبيع البيانات + حمايات
import Head from "next/head";
import InstantLink from '@/components/InstantLink';
import { useEffect, useState } from "react";

type Reservation = { id: string|number; propertyId?: string; userId?: string; date?: string; status?: string };

export default function ReservationsListPage() {
  const [items, setItems] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const r = await fetch("/api/reservations");
        const json = await r.json().catch(() => ({}));
        // يقبل {items:[]}|[]|{data:[]}
        const arr =
          Array.isArray(json?.items) ? json.items :
          Array.isArray(json?.data)  ? json.data  :
          Array.isArray(json)        ? json       : [];
        const norm: Reservation[] = arr.map((x: any, i: number) => ({
          id: x?.id ?? i+1,
          propertyId: x?.propertyId ?? x?.property_id ?? "-",
          userId: x?.userId ?? x?.user_id ?? "-",
          date: x?.date ?? x?.createdAt ?? x?.created_at ?? "",
          status: x?.status ?? "pending",
        }));
        setItems(norm);
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <main className="min-h-screen bg-slate-50">
      <Head><title>الحجوزات | Ain Oman</title></Head>
      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">الحجوزات</h1>
          <InstantLink href="/admin/dashboard?section=reservations" className="rounded-xl border px-3 py-1.5 text-sm hover:bg-slate-50">
            لوحة التحكم
          </InstantLink>
        </div>

        {loading ? (
          <p className="text-slate-500">جارٍ التحميل…</p>
        ) : items.length === 0 ? (
          <p className="text-slate-500">لا توجد حجوزات.</p>
        ) : (
          <div className="overflow-auto rounded-2xl border bg-white">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="p-2 text-start">#</th>
                  <th className="p-2 text-start">العقار</th>
                  <th className="p-2 text-start">المستخدم</th>
                  <th className="p-2 text-start">التاريخ</th>
                  <th className="p-2 text-start">الحالة</th>
                </tr>
              </thead>
              <tbody>
                {items.map((x) => (
                  <tr key={String(x.id)} className="border-b">
                    <td className="p-2">{x.id}</td>
                    <td className="p-2">{x.propertyId}</td>
                    <td className="p-2">{x.userId}</td>
                    <td className="p-2">{x.date || "-"}</td>
                    <td className="p-2">{x.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
