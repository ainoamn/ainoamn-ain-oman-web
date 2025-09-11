// src/pages/dashboard/requests/index.tsx
import Head from "next/head";
import { useEffect, useState } from "react";
import Layout from "@/components/layout/Layout";

function getSession() {
  if (typeof window === "undefined") return null;
  const uid = localStorage.getItem("ao_uid");
  const name = localStorage.getItem("ao_name") || "عميل";
  const phone = localStorage.getItem("ao_phone") || "";
  if (!uid) return null;
  return { userId: uid, name, phone };
}

export default function MyRequests() {
  const me = getSession();
  const [views, setViews] = useState<any[]>([]);
  const [books, setBooks] = useState<any[]>([]);

  useEffect(()=>{
    if (!me) return;
    fetch(`/api/requests/viewings?userId=${encodeURIComponent(me.userId)}`).then(r=>r.json()).then(d=> setViews(d?.items || []));
    fetch(`/api/requests/bookings?userId=${encodeURIComponent(me.userId)}`).then(r=>r.json()).then(d=> setBooks(d?.items || []));
  }, []);

  return (
    <Layout>
      <Head><title>طلباتي | Ain Oman</title></Head>
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-6">
          <h1 className="text-2xl font-bold mb-4">طلباتي</h1>
          {!me && <div className="text-sm text-red-600 mb-4">الرجاء تسجيل الدخول من <a className="underline" href="/auth/login">هنا</a>.</div>}

          <section className="bg-white border rounded-xl p-4 mb-6">
            <div className="font-semibold mb-2">طلبات المعاينة</div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-2">العقار</th>
                    <th className="p-2">التاريخ</th>
                    <th className="p-2">الوقت</th>
                    <th className="p-2">الحالة</th>
                    <th className="p-2">اقتراح المالك</th>
                  </tr>
                </thead>
                <tbody>
                  {views.map(v=>(
                    <tr key={v.id} className="border-t">
                      <td className="p-2">#{v.propertyId}</td>
                      <td className="p-2">{v.date}</td>
                      <td className="p-2">{v.time}</td>
                      <td className="p-2">{v.status}</td>
                      <td className="p-2">{v.status==="proposed" ? `${v.proposedDate} ${v.proposedTime}` : "—"}</td>
                    </tr>
                  ))}
                  {views.length===0 && <tr><td className="p-3 text-gray-500" colSpan={5}>لا توجد طلبات.</td></tr>}
                </tbody>
              </table>
            </div>
          </section>

          <section className="bg-white border rounded-xl p-4">
            <div className="font-semibold mb-2">طلبات الحجز</div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-2">العقار</th>
                    <th className="p-2">تاريخ البدء</th>
                    <th className="p-2">المدة</th>
                    <th className="p-2">العربون</th>
                    <th className="p-2">الحالة</th>
                  </tr>
                </thead>
                <tbody>
                  {books.map(b=>(
                    <tr key={b.id} className="border-t">
                      <td className="p-2">#{b.propertyId}</td>
                      <td className="p-2">{b.start}</td>
                      <td className="p-2">{b.months} شهر</td>
                      <td className="p-2">{b.depositOMR?.toFixed?.(3)} ر.ع</td>
                      <td className="p-2">{b.status}</td>
                    </tr>
                  ))}
                  {books.length===0 && <tr><td className="p-3 text-gray-500" colSpan={5}>لا توجد طلبات.</td></tr>}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>
    </Layout>
  );
}
