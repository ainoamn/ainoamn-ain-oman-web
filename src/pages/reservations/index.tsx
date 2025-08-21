/**
 * Admin-like list: Reservations
 * Path: /reservations
 * Location: src/pages/reservations/index.tsx
 */
import { useEffect, useState } from "react";
import Head from "next/head";
import Layout from "@/components/layout/Layout";
import type { Reservation } from "@/types/billing";
import { listReservations, approveReservation, rejectReservation } from "@/lib/billingClient";

export default function ReservationsListPage() {
  const [items, setItems] = useState<Reservation[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);
      const r = await listReservations();
      setItems(r);
    } catch (e: any) {
      setErr(e?.message || "فشل التحميل");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const approve = async (id: string) => { await approveReservation(id); await load(); };
  const reject = async (id: string) => { await rejectReservation(id); await load(); };

  return (
    <Layout>
      <Head><title>الحجوزات</title></Head>
      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">الحجوزات</h1>
          <button onClick={load} className="rounded-xl px-3 py-1.5 text-sm ring-1 ring-gray-200 hover:bg-gray-50">تحديث</button>
        </div>

        {err && <div className="mb-3 rounded-lg bg-red-50 p-3 text-sm text-red-700 ring-1 ring-red-200">{err}</div>}

        {loading ? (
          <div className="rounded-lg bg-white p-6 ring-1 ring-gray-200">جارٍ التحميل…</div>
        ) : items.length === 0 ? (
          <div className="text-sm text-gray-500">لا توجد حجوزات.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="p-2 text-left">#</th>
                  <th className="p-2 text-left">العقار</th>
                  <th className="p-2 text-left">العميل</th>
                  <th className="p-2 text-left">المبلغ</th>
                  <th className="p-2 text-left">الحالة</th>
                  <th className="p-2 text-left">فاتورة</th>
                  <th className="p-2 text-left">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {items.map((x) => (
                  <tr key={x.id} className="border-b">
                    <td className="p-2">{x.id}</td>
                    <td className="p-2">{x.propertyId}</td>
                    <td className="p-2">{x.customerName}</td>
                    <td className="p-2">{x.amount} {x.currency}</td>
                    <td className="p-2">{x.status}</td>
                    <td className="p-2">{x.invoiceId || "-"}</td>
                    <td className="p-2">
                      {x.status === "pending" ? (
                        <div className="flex gap-2">
                          <button onClick={() => approve(x.id)} className="rounded-lg px-2 py-1 text-xs ring-1 ring-emerald-200 hover:bg-emerald-50">موافقة</button>
                          <button onClick={() => reject(x.id)} className="rounded-lg px-2 py-1 text-xs text-red-700 ring-1 ring-red-200 hover:bg-red-50">رفض</button>
                        </div>
                      ) : (
                        <span className="text-gray-500 text-xs">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
}
