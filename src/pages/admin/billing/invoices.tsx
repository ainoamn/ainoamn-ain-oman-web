/**
 * Admin: Invoices
 * Path: /admin/billing/invoices
 * Location: src/pages/admin/billing/invoices.tsx
 */
import { useEffect, useState } from "react";
import Head from "next/head";
import Layout from "@/components/layout/Layout";
import type { Invoice } from "@/types/billing";
import { listInvoices, payInvoice } from "@/lib/billingClient";

export default function InvoicesAdminPage() {
  const [items, setItems] = useState<Invoice[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);
      const r = await listInvoices();
      setItems(r);
    } catch (e: any) {
      setErr(e?.message || "فشل التحميل");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const markPaid = async (id: string, amount: number) => {
    await payInvoice(id, amount, "cash");
    await load();
  };

  return (
    <Layout>
      <Head><title>الفواتير</title></Head>
      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">الفواتير</h1>
          <button onClick={load} className="rounded-xl px-3 py-1.5 text-sm ring-1 ring-gray-200 hover:bg-gray-50">تحديث</button>
        </div>

        {err && <div className="mb-3 rounded-lg bg-red-50 p-3 text-sm text-red-700 ring-1 ring-red-200">{err}</div>}

        {loading ? (
          <div className="rounded-lg bg-white p-6 ring-1 ring-gray-200">جارٍ التحميل…</div>
        ) : items.length === 0 ? (
          <div className="text-sm text-gray-500">لا توجد فواتير.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="p-2 text-left">#</th>
                  <th className="p-2 text-left">الحجز</th>
                  <th className="p-2 text-left">العميل</th>
                  <th className="p-2 text-left">المبلغ</th>
                  <th className="p-2 text-left">الحالة</th>
                  <th className="p-2 text-left">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {items.map((x) => (
                  <tr key={x.id} className="border-b">
                    <td className="p-2">{x.id}</td>
                    <td className="p-2">{x.reservationId}</td>
                    <td className="p-2">{x.customerName}</td>
                    <td className="p-2">{x.amount} {x.currency}</td>
                    <td className="p-2">{x.status}</td>
                    <td className="p-2">
                      {x.status === "unpaid" ? (
                        <button onClick={() => markPaid(x.id, x.amount)} className="rounded-lg px-2 py-1 text-xs ring-1 ring-emerald-200 hover:bg-emerald-50">
                          تأكيد الدفع نقدًا
                        </button>
                      ) : (
                        <span className="text-gray-500 text-xs">{x.paidAt ? new Date(x.paidAt).toLocaleString() : "—"}</span>
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
