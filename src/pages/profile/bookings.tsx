// src/pages/profile/bookings.tsx
import Head from "next/head";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

/* ====== Types aligned with your API ====== */
type BookingStatus = "pending" | "reserved" | "leased" | "cancelled";
type Booking = {
  id: string;
  bookingNumber: string;
  propertyId: string;
  propertyTitle?: string;
  propertyReference?: string;
  startDate: string;
  endDate?: string;
  duration: number;
  totalAmount: number;
  status: BookingStatus;
  createdAt: string;
  contractSigned?: boolean;
  customerInfo: { name: string; phone: string; email?: string };
  ownerDecision?: { approved?: boolean; reason?: string; decidedAt?: string } | null;
};

function fmtOMR(n: number) {
  return new Intl.NumberFormat("ar-OM", {
    style: "currency",
    currency: "OMR",
    maximumFractionDigits: 3,
  }).format(Number(n || 0));
}
function statusLabel(s: BookingStatus) {
  if (s === "reserved") return "محجوز";
  if (s === "leased") return "مؤجّر";
  if (s === "cancelled") return "ملغى";
  return "قيد المراجعة";
}
function toDate(s?: string) {
  if (!s) return "-";
  try {
    const d = new Date(s);
    return d.toLocaleDateString("ar-OM", { year: "numeric", month: "2-digit", day: "2-digit" });
  } catch {
    return s;
  }
}

/* ====== API sync helpers ====== */
/** Upsert to unified API. Prefers /api/bookings/ensure if available, falls back to POST /api/bookings. */
async function upsertBookingToApi(b: Booking) {
  try {
    // Try idempotent ensure endpoint
    const ensureResp = await fetch("/api/bookings/ensure", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        id: b.id,
        bookingNumber: b.bookingNumber,
        propertyId: b.propertyId,
        propertyTitle: b.propertyTitle,
        propertyReference: b.propertyReference,
        startDate: b.startDate,
        endDate: b.endDate,
        duration: b.duration,
        totalAmount: b.totalAmount,
        status: b.status || "reserved",
        contractSigned: !!b.contractSigned,
        customerInfo: b.customerInfo || { name: "", phone: "", email: "" },
      }),
    });
    if (ensureResp.ok) return true;
  } catch {
    // ignore and try fallback
  }
  try {
    // Fallback: plain POST (non-idempotent)
    const r = await fetch("/api/bookings", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(b),
    });
    return r.ok;
  } catch {
    return false;
  }
}

/** Sync localStorage list to API store. Skips items already present. */
async function syncLocalToApi(list: Booking[]) {
  try {
    const api = await fetch("/api/bookings");
    const data = api.ok ? await api.json() : { items: [] };
    const serverItems: Map<string, Booking> = new Map(
      (Array.isArray(data?.items) ? data.items : []).map((x: Booking) => [x.id, x])
    );
    for (const bk of list) {
      if (!serverItems.has(bk.id)) {
        await upsertBookingToApi(bk);
      }
    }
    return true;
  } catch {
    return false;
  }
}

/* ====== Page ====== */
export default function ProfileBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load from localStorage then sync to API
  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      setError(null);
      try {
        const stored = JSON.parse(localStorage.getItem("propertyBookings") || "[]");
        const clean: Booking[] = Array.isArray(stored) ? stored : [];
        setBookings(clean);
        await syncLocalToApi(clean);
      } catch (e) {
        setError("تعذّر تحميل الحجوزات من المتصفح");
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  async function manualSync() {
    setSyncing(true);
    await syncLocalToApi(bookings);
    setSyncing(false);
    alert("تمت المزامنة مع المخزن المركزي.");
  }

  // Also show what server has, for quick compare
  const [serverItems, setServerItems] = useState<Booking[]>([]);
  async function refreshServer() {
    try {
      const r = await fetch("/api/bookings");
      const d = r.ok ? await r.json() : { items: [] };
      setServerItems(Array.isArray(d?.items) ? d.items : []);
    } catch {
      setServerItems([]);
    }
  }
  useEffect(() => {
    refreshServer();
  }, [syncing, loading]);

  const missingOnServer = useMemo(() => {
    const ids = new Set(serverItems.map((x) => x.id));
    return bookings.filter((b) => !ids.has(b.id));
  }, [bookings, serverItems]);

  return (
    <div className="min-h-screen flex flex-col">
      <Head><title>حجوزاتي</title></Head>
      <Header />

      <main className="container mx-auto p-4 flex-1 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">حجوزاتي</h1>
          <div className="flex items-center gap-2">
            <button className="btn btn-outline" onClick={refreshServer}>تحديث من الخادم</button>
            <button className="btn btn-primary" onClick={manualSync} disabled={syncing}>
              {syncing ? "جارٍ المزامنة…" : "مزامنة مع الخادم"}
            </button>
          </div>
        </div>

        {loading ? (
          <div>جارٍ التحميل…</div>
        ) : error ? (
          <div className="text-red-600">{error}</div>
        ) : (
          <>
            {/* Local list */}
            <section className="space-y-2">
              <div className="font-semibold">الحجوزات المخزّنة محليًا</div>
              <div className="overflow-auto">
                <table className="w-full text-sm border">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="p-2 text-left">رقم الحجز</th>
                      <th className="p-2 text-left">العقار</th>
                      <th className="p-2 text-left">العميل</th>
                      <th className="p-2 text-left">بداية</th>
                      <th className="p-2 text-left">المدة</th>
                      <th className="p-2 text-left">المبلغ</th>
                      <th className="p-2 text-left">الحالة</th>
                      <th className="p-2 text-left">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((b) => (
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
                        <td className="p-2">{toDate(b.startDate)}</td>
                        <td className="p-2">{b.duration}</td>
                        <td className="p-2">{fmtOMR(b.totalAmount || 0)}</td>
                        <td className="p-2">{statusLabel(b.status)}</td>
                        <td className="p-2">
                          <div className="flex items-center gap-2">
                            <Link href={`/admin/bookings/${encodeURIComponent(b.id)}`} className="btn btn-outline">عرض العقد</Link>
                            <Link href={`/properties/${encodeURIComponent(b.propertyId)}`} className="btn">صفحة العقار</Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {bookings.length === 0 && (
                      <tr>
                        <td className="p-3 text-center text-gray-600" colSpan={8}>لا توجد حجوزات محلية.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              {missingOnServer.length > 0 && (
                <div className="text-xs text-orange-700">
                  ملاحظة: توجد {missingOnServer.length} حجوزات محلية غير موجودة على الخادم. اضغط "مزامنة مع الخادم".
                </div>
              )}
            </section>

            {/* Server list snapshot */}
            <section className="space-y-2">
              <div className="font-semibold">لقطة من الخادم (/api/bookings)</div>
              <div className="overflow-auto">
                <table className="w-full text-sm border">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="p-2 text-left">رقم الحجز</th>
                      <th className="p-2 text-left">العقار</th>
                      <th className="p-2 text-left">العميل</th>
                      <th className="p-2 text-left">المبلغ</th>
                      <th className="p-2 text-left">الحالة</th>
                      <th className="p-2 text-left">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {serverItems.map((b) => (
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
                          <Link href={`/admin/bookings/${encodeURIComponent(b.id)}`} className="btn btn-outline">عرض العقد</Link>
                        </td>
                      </tr>
                    ))}
                    {serverItems.length === 0 && (
                      <tr>
                        <td className="p-3 text-center text-gray-600" colSpan={6}>لا توجد حجوزات على الخادم.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
