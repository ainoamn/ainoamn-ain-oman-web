import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

type BookingStatus = "pending" | "reserved" | "leased" | "cancelled";
type Booking = {
  id: string;
  bookingNumber: string;
  propertyId: string;
  propertyTitle?: string;
  propertyReference?: string;
  startDate: string;
  duration: number;
  totalAmount: number;
  status: BookingStatus;
  createdAt: string;
  contractSigned?: boolean;
  customerInfo: { name: string; phone: string; email?: string };
  ownerDecision?: { approved?: boolean; reason?: string; decidedAt?: string } | null;
};

function fmtOMR(n:number){ return new Intl.NumberFormat("ar-OM",{style:"currency",currency:"OMR",maximumFractionDigits:3}).format(n); }
function statusLabel(s: BookingStatus){
  if (s==="reserved") return "محجوز";
  if (s==="leased") return "مؤجّر";
  if (s==="cancelled") return "ملغى";
  return "قيد المراجعة";
}

export default function AdminBookingsListPage(){
  const [items, setItems] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string|null>(null);

  useEffect(()=>{
    setLoading(true); setErr(null);
    fetch("/api/bookings")
      .then(r=>r.json())
      .then(d=>setItems(Array.isArray(d?.items)? d.items : []))
      .catch(()=>setErr("تعذّر جلب البيانات"))
      .finally(()=>setLoading(false));
  },[]);

  return (
    <div className="min-h-screen flex flex-col">
      <Head><title>الحجوزات</title></Head>
      <Header />
      <main className="container mx-auto p-4 flex-1 space-y-4">
        <h1 className="text-xl font-semibold">قائمة الحجوزات</h1>

        {loading ? <div>جارٍ التحميل…</div> : err ? <div className="text-red-600">{err}</div> : (
          <div className="overflow-auto">
            <table className="w-full text-sm border">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="p-2 text-left">رقم الحجز</th>
                  <th className="p-2 text-left">العقار</th>
                  <th className="p-2 text-left">العميل</th>
                  <th className="p-2 text-left">القيمة</th>
                  <th className="p-2 text-left">الحالة</th>
                  <th className="p-2 text-left">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {items.map(b=>(
                  <tr key={b.id} className="border-b">
                    <td className="p-2">{b.bookingNumber}</td>
                    <td className="p-2">
                      <div className="flex flex-col">
                        <span className="font-medium">{b.propertyTitle || "-"}</span>
                        <span className="text-xs text-gray-600">{b.propertyReference || "-"}</span>
                      </div>
                    </td>
                    <td className="p-2">
                      <div className="flex flex-col">
                        <span>{b.customerInfo?.name || "-"}</span>
                        <span className="text-xs text-gray-600">{b.customerInfo?.phone || "-"}</span>
                      </div>
                    </td>
                    <td className="p-2">{fmtOMR(b.totalAmount || 0)}</td>
                    <td className="p-2">{statusLabel(b.status)}</td>
                    <td className="p-2">
                      <Link href={`/admin/bookings/${encodeURIComponent(b.id)}`} className="btn btn-outline">فتح</Link>
                    </td>
                  </tr>
                ))}
                {items.length===0 && (
                  <tr><td className="p-3 text-center text-gray-600" colSpan={6}>لا توجد حجوزات.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
