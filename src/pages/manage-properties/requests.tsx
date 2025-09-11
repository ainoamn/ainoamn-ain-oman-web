// src/pages/manage-properties/requests.tsx
import Head from "next/head";
import { useEffect, useState } from "react";
import Layout from "@/components/layout/Layout";

type Viewing = {
  id:string; propertyId:string; customerId:string;
  preferredDate?:string; preferredTime?:string;
  status:"new"|"approved"|"declined"|"suggested";
  suggestedWhen?:string; createdAt:string;
};

type Booking = {
  id:string; propertyId:string; customerId:string;
  start:string; months:number; amountOMR?:number;
  status:"awaiting_payment"|"pending"|"confirmed"|"declined";
  createdAt:string;
};

export default function RequestsBoard(){
  const [viewings, setViewings] = useState<Viewing[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      const vv = await fetch(`/api/viewings?role=owner`).then(r=>r.json()).catch(()=>({items:[]}));
      const bb = await fetch(`/api/bookings?role=owner`).then(r=>r.json()).catch(()=>({items:[]}));
      setViewings(Array.isArray(vv?.items)? vv.items : []);
      setBookings(Array.isArray(bb?.items)? bb.items : []);
      setLoading(false);
    };
    run();
  }, []);

  return (
    <Layout>
      <Head><title>طلبات المشاهدة والحجوزات | Ain Oman</title></Head>
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-7xl p-6">
          <h1 className="text-xl font-bold mb-4">لوحة الطلبات</h1>

          {loading ? <div>جارِ التحميل…</div> : (
            <>
              {/* طلبات المشاهدة */}
              <section className="mb-8">
                <div className="text-lg font-semibold mb-2">طلبات المشاهدة</div>
                <div className="bg-white rounded-2xl shadow overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700">
                        <th className="px-3 py-2 text-start">#</th>
                        <th className="px-3 py-2 text-start">الطلب</th>
                        <th className="px-3 py-2 text-start">العقار</th>
                        <th className="px-3 py-2 text-start">التاريخ/الوقت</th>
                        <th className="px-3 py-2 text-start">الحالة</th>
                        <th className="px-3 py-2 text-start">أُنشئت</th>
                      </tr>
                    </thead>
                    <tbody>
                      {viewings.length === 0 ? (
                        <tr><td className="px-3 py-6 text-center text-slate-500" colSpan={6}>لا توجد طلبات مشاهدة</td></tr>
                      ) : viewings.map((v,i)=>(
                        <tr key={v.id} className="border-t">
                          <td className="px-3 py-2">{i+1}</td>
                          <td className="px-3 py-2 font-mono">{v.id}</td>
                          <td className="px-3 py-2">{v.propertyId}</td>
                          <td className="px-3 py-2">{v.preferredDate} {v.preferredTime}</td>
                          <td className="px-3 py-2">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              v.status==="approved" ? "bg-emerald-100 text-emerald-700"
                              : v.status==="declined" ? "bg-rose-100 text-rose-700"
                              : v.status==="suggested" ? "bg-indigo-100 text-indigo-700"
                              : "bg-amber-100 text-amber-700"
                            }`}>{v.status}</span>
                          </td>
                          <td className="px-3 py-2">{new Date(v.createdAt).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* الحجوزات */}
              <section>
                <div className="text-lg font-semibold mb-2">حجوزات الإيجار</div>
                <div className="bg-white rounded-2xl shadow overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700">
                        <th className="px-3 py-2 text-start">#</th>
                        <th className="px-3 py-2 text-start">الحجز</th>
                        <th className="px-3 py-2 text-start">العقار</th>
                        <th className="px-3 py-2 text-start">البداية</th>
                        <th className="px-3 py-2 text-start">الأشهر</th>
                        <th className="px-3 py-2 text-start">المبلغ</th>
                        <th className="px-3 py-2 text-start">الحالة</th>
                        <th className="px-3 py-2 text-start">أُنشئ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.length === 0 ? (
                        <tr><td className="px-3 py-6 text-center text-slate-500" colSpan={8}>لا توجد حجوزات</td></tr>
                      ) : bookings.map((b,i)=>(
                        <tr key={b.id} className="border-t">
                          <td className="px-3 py-2">{i+1}</td>
                          <td className="px-3 py-2 font-mono">{b.id}</td>
                          <td className="px-3 py-2">{b.propertyId}</td>
                          <td className="px-3 py-2">{b.start}</td>
                          <td className="px-3 py-2">{b.months}</td>
                          <td className="px-3 py-2">{(b.amountOMR??0).toFixed(3)} OMR</td>
                          <td className="px-3 py-2">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              b.status==="confirmed" ? "bg-emerald-100 text-emerald-700"
                              : b.status==="pending" ? "bg-amber-100 text-amber-700"
                              : b.status==="declined" ? "bg-rose-100 text-rose-700"
                              : "bg-slate-100 text-slate-700"
                            }`}>{b.status}</span>
                          </td>
                          <td className="px-3 py-2">{new Date(b.createdAt).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </>
          )}
        </div>
      </main>
    </Layout>
  );
}
