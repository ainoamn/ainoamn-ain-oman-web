// src/pages/admin/invoices.tsx
import Head from "next/head";
import Layout from "@/components/layout/Layout";
import type { GetServerSideProps } from "next";
import { adminCookieName } from "@/server/auth";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

type Invoice = {
  id: string; serial: string; reservationId: string; propertyId: string; unitId?: string;
  currency: "OMR"; amount: number; status: "unpaid" | "paid" | "canceled";
  items: { title: string; qty: number; price: number; total: number }[];
  issuedAt: string; dueAt?: string; paidAt?: string;
};

export default function AdminInvoicesPage() {
  const [items, setItems] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const openId = typeof router.query.open === "string" ? router.query.open : "";

  const load = async () => {
    setLoading(true);
    const r = await fetch("/api/invoices");
    const j = await r.json();
    setItems(j?.items || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const setStatus = async (id: string, status: "unpaid" | "paid" | "canceled") => {
    const r = await fetch(`/api/invoices/${id}/status`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
    if (!r.ok) alert("فشل التحديث");
    await load();
  };

  return (
    <Layout>
      <Head><title>الفواتير</title></Head>
      <div className="max-w-6xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">الفواتير</h1>
        {loading ? "جارٍ التحميل…" : (
          <div className="overflow-auto border rounded">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-2">#</th>
                  <th className="p-2">الرقم</th>
                  <th className="p-2">الحالة</th>
                  <th className="p-2">العقار/الوحدة</th>
                  <th className="p-2">الإجمالي</th>
                  <th className="p-2">أصدر في</th>
                  <th className="p-2">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {items.map((it, i) => (
                  <tr key={it.id} className={`border-t ${openId && (it.id===openId || it.serial===openId) ? "bg-yellow-50" : ""}`}>
                    <td className="p-2">{i+1}</td>
                    <td className="p-2">{it.serial}</td>
                    <td className="p-2">{it.status}</td>
                    <td className="p-2">#{it.propertyId}{it.unitId ? ` / ${it.unitId}` : ""}</td>
                    <td className="p-2">{it.amount} OMR</td>
                    <td className="p-2">{new Date(it.issuedAt).toLocaleString()}</td>
                    <td className="p-2 space-x-2 space-x-reverse">
                      <button onClick={()=>setStatus(it.id, "paid")} className="px-2 py-1 rounded bg-emerald-600 text-white">تأشير مدفوع</button>
                      <button onClick={()=>setStatus(it.id, "unpaid")} className="px-2 py-1 rounded bg-gray-500 text-white">غير مدفوع</button>
                      <button onClick={()=>setStatus(it.id, "canceled")} className="px-2 py-1 rounded bg-rose-600 text-white">إلغاء</button>
                    </td>
                  </tr>
                ))}
                {items.length===0 && <tr><td className="p-3 text-center text-gray-500" colSpan={7}>لا توجد فواتير.</td></tr>}
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
