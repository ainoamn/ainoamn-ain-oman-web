// src/pages/admin/reservations.tsx
import Head from "next/head";
import Layout from "@/components/layout/Layout";
import type { GetServerSideProps } from "next";
import { adminCookieName } from "@/server/auth";
import { useEffect, useState } from "react";

type Reservation = {
  id: string; propertyId: string; unitId?: string;
  name: string; phone: string; startDate: string;
  periodMonths?: number; periodDays?: number;
  createdAt: string; status?: string; invoiceId?: string;
};

export default function AdminReservationsPage() {
  const [items, setItems] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const r = await fetch("/api/reservations");
    const j = await r.json();
    setItems(j?.items || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const setStatus = async (id: string, status: "approved" | "rejected") => {
    const r = await fetch(`/api/reservations/${id}/status`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
    if (!r.ok) alert("فشل التحديث");
    await load();
  };

  return (
    <Layout>
      <Head><title>إدارة الحجوزات</title></Head>
      <div className="max-w-5xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">الحجوزات</h1>
        {loading ? "جارٍ التحميل…" : (
          <div className="overflow-auto border rounded">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-2">#</th>
                  <th className="p-2">الحالة</th>
                  <th className="p-2">العقار/الوحدة</th>
                  <th className="p-2">العميل</th>
                  <th className="p-2">تاريخ البدء/المدة</th>
                  <th className="p-2">فاتورة</th>
                  <th className="p-2">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {items.map((it, i) => (
                  <tr key={it.id} className="border-t">
                    <td className="p-2">{i+1}</td>
                    <td className="p-2">{it.status || "-"}</td>
                    <td className="p-2">#{it.propertyId}{it.unitId ? ` / ${it.unitId}` : ""}</td>
                    <td className="p-2">{it.name} — {it.phone}</td>
                    <td className="p-2">{it.startDate} — {it.periodMonths ? `${it.periodMonths} شهر` : it.periodDays ? `${it.periodDays} يوم` : "-"}</td>
                    <td className="p-2">{it.invoiceId ? <a className="underline" href={`/admin/invoices?open=${encodeURIComponent(it.invoiceId)}`}>{it.invoiceId}</a> : "-"}</td>
                    <td className="p-2 space-x-2 space-x-reverse">
                      <button onClick={()=>setStatus(it.id, "approved")} className="px-2 py-1 rounded bg-emerald-600 text-white">موافقة</button>
                      <button onClick={()=>setStatus(it.id, "rejected")} className="px-2 py-1 rounded bg-rose-600 text-white">رفض</button>
                    </td>
                  </tr>
                ))}
                {items.length===0 && <tr><td className="p-3 text-center text-gray-500" colSpan={7}>لا توجد حجوزات.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const cookieName = adminCookieName();
  const key = (ctx.req as any)?.cookies?.[cookieName];
  const adminKey = process.env.ADMIN_KEY || "";
  if (!key || key !== adminKey) {
    return { redirect: { destination: "/admin/login", permanent: false } };
  }
  return { props: {} };
};
