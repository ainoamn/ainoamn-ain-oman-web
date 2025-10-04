//c/pages/properties/[id]/bookings.tsx
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { FaClock } from "react-icons/fa";

/** نوع مرن ليستوعب اختلافات الحقول بين APIs موجودة لديك */
type Booking = {
  id: string;
  propertyId?: string;
  unitId?: string;
  status?: string; // pending | confirmed | cancelled ...
  totalAmount?: number | string; // قد تأتي نصًّا
  createdAt?: string;
  customerInfo?: { name?: string; phone?: string; email?: string };
  meta?: Record<string, any>;
  [k: string]: any;
};

const fmtAmount = (v: unknown) => {
  const n = Number.parseFloat(String(v ?? "0"));
  return Number.isFinite(n) ? n.toFixed(3) : "0.000";
};
const fmtDate = (v: unknown) => {
  const d = v ? new Date(String(v)) : new Date();
  return isNaN(d.getTime()) ? "-" : d.toLocaleDateString("ar-OM");
};

export default function PropertyBookingsPage() {
  const router = useRouter();
  const id = String(router.query.id || "");

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // محاولات متعددة لمصادر البيانات مع نفس الشكل النهائي
  async function fetchFrom(url: string) {
    const r = await fetch(url, { cache: "no-store" });
    if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
    const j = await r.json();
    // دعم صيغ متعددة: {items:[]}, {data:[]}, [] مباشر
    const arr: any[] = Array.isArray(j) ? j : (j.items || j.data || []);
    return Array.isArray(arr) ? arr : [];
  }

  async function load() {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      // 1) المفضّل: نظام الحجوزات لديك
      let list =
        (await fetchFrom(`/api/reservations?propertyId=${encodeURIComponent(id)}`).catch(() => [])) as Booking[];

      // 2) بديل: الطلبات المعلّمة كحجز
      if (!list.length) {
        const alt = (await fetchFrom(
          `/api/requests?propertyId=${encodeURIComponent(id)}&type=booking`
        ).catch(() => [])) as Booking[];
        list = alt;
      }

      // 3) بديل أخير: نقطة عامة للحجوزات إن وُجدت
      if (!list.length) {
        const alt2 = (await fetchFrom(`/api/bookings?propertyId=${encodeURIComponent(id)}`).catch(() => [])) as Booking[];
        list = alt2;
      }

      // تطبيع خفيف ومنع أعطال العرض
      const normalized = (list || []).map((b: any) => ({
        id: String(b.id ?? b.bookingId ?? `${Date.now()}`),
        propertyId: b.propertyId ?? id,
        unitId: b.unitId,
        status: b.status ?? b.state ?? "pending",
        totalAmount: b.totalAmount ?? b.total ?? b.amount ?? 0,
        createdAt: b.createdAt ?? b.created_at ?? b.date ?? new Date().toISOString(),
        customerInfo: b.customerInfo ?? b.customer ?? { name: b.name, phone: b.phone, email: b.email },
        meta: b.meta ?? {},
        ...b,
      }));

      setBookings(normalized);
    } catch (e: any) {
      setError(e?.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const count = bookings?.length || 0;

  const content = useMemo(() => {
    if (loading) return <div className="p-6">جار التحميل…</div>;
    if (error) {
      return (
        <div className="p-6">
          <div className="mb-4">
            <Link href={`/properties/${encodeURIComponent(id)}`} className="text-blue-600 underline">
              عودة إلى القائمة
            </Link>
          </div>
          <div className="rounded-xl border border-red-300 bg-red-50 p-4 text-red-700">
            تعذّر جلب البيانات: {error}
          </div>
        </div>
      );
    }
    if (!Array.isArray(bookings) || bookings.length === 0) {
      return (
        <div className="p-6">
          <div className="mb-4">
            <Link href={`/properties/${encodeURIComponent(id)}`} className="text-blue-600 underline">
              عودة إلى القائمة
            </Link>
          </div>
          <div className="rounded-xl border p-4">لا توجد حجوزات لهذا العقار.</div>
        </div>
      );
    }

    return (
      <div className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <Link href={`/properties/${encodeURIComponent(id)}`} className="text-blue-600 underline">
            عودة إلى القائمة
          </Link>
          <div className="text-sm text-gray-500">عدد الحجوزات: {count}</div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {Array.isArray(bookings)
            ? bookings.map((booking) => (
                <div key={booking.id} className="rounded-2xl border p-4 shadow-sm">
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="text-lg font-semibold">حجز #{booking.id}</h3>
                    <span className="rounded-full border px-3 py-1 text-xs">
                      {String(booking.status ?? "pending")}
                    </span>
                  </div>

                  <div className="grid gap-2 md:grid-cols-2">
                    <div>
                      <p className="text-gray-600">الوحدة: {booking.unitId ?? "-"}</p>
                      <p className="text-gray-600">الاسم: {booking.customerInfo?.name || "-"}</p>
                      <p className="text-gray-600">البريد: {booking.customerInfo?.email || "-"}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">
                        المبلغ الإجمالي: {fmtAmount(booking?.totalAmount)} ر.ع
                      </p>
                      <p className="text-gray-600 flex items-center">
                        <FaClock className="ml-2" />
                        تاريخ الحجز: {fmtDate(booking?.createdAt)}
                      </p>
                      <p className="text-gray-600">الهاتف: {booking.customerInfo?.phone || "-"}</p>
                    </div>
                  </div>
                </div>
              ))
            : null}
        </div>
      </div>
    );
  }, [loading, error, bookings, id, count]);

  return (
    <div className="max-w-6xl mx-auto">
      <header className="p-6">
        <h1 className="text-2xl font-semibold">حجوزات العقار</h1>
        <p className="text-sm text-gray-500">المسار: /properties/{id}/bookings</p>
      </header>
      {content}
    </div>
  );
}
