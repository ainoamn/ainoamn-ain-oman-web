// @ts-nocheck
// src/pages/profile/bookings.tsx
import Head from "next/head";
import InstantLink from '@/components/InstantLink';
import { useEffect, useMemo, useState, useCallback } from "react";
// Header and Footer are now handled by MainLayout in _app.tsx
import SmartSyncIndicator from "@/components/booking/SmartSyncIndicator";
// import { bookingSyncEngine, Booking, SyncEvent } from "@/lib/bookingSyncEngine";

// Mock types for now
interface Booking {
  id: string;
  bookingNumber: string;
  propertyId: string;
  propertyTitle?: string;
  propertyReference?: string;
  startDate?: string;
  endDate?: string;
  duration?: number;
  totalAmount?: number;
  status?: string;
  contractSigned?: boolean;
  customerInfo?: {
    name?: string;
    phone?: string;
    email?: string;
  };
}

interface SyncEvent {
  type: string;
  timestamp: string;
}

// Mock bookingSyncEngine
const bookingSyncEngine = {
  on: () => {},
  off: () => {},
  forceSync: async () => {}
};

/* ====== Types aligned with your API ====== */
type BookingStatus = "pending" | "reserved" | "leased" | "cancelled" | "accounting";

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
  if (s === "accounting") return "محاسبي";
  return "قيد المراجعة";
}
function toDate(s?: string) {
  if (!s) return "-";
  try {
    const d = new Date(s);
    return d.toLocaleDateString('ar', { calendar: 'gregory', numberingSystem: 'latn',  year: "numeric", month: "2-digit", day: "2-digit" });
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
  const [syncEvents, setSyncEvents] = useState<SyncEvent[]>([]);

  // مراقبة أحداث المزامنة
  useEffect(() => {
    const handleSyncEvent = (event: SyncEvent) => {
      setSyncEvents(prev => [event, ...prev.slice(0, 9)]); // الاحتفاظ بآخر 10 أحداث
      
      if (event.type === 'booking_created' || event.type === 'booking_updated') {
        // تحديث قائمة الحجوزات
        fetchBookings();
      }
    };

    bookingSyncEngine.on('sync_event', handleSyncEvent);
    
    return () => {
      bookingSyncEngine.off('sync_event', handleSyncEvent);
    };
  }, []);

  // دالة جلب الحجوزات
  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Load from API first
      const apiResponse = await fetch("/api/bookings");
      if (apiResponse.ok) {
        const apiData = await apiResponse.json();
        const apiBookings: Booking[] = Array.isArray(apiData?.items) ? apiData.items : [];
        setBookings(apiBookings);
      } else {
        // Fallback to localStorage if API fails
        const stored = JSON.parse(localStorage.getItem("propertyBookings") || "[]");
        const clean: Booking[] = Array.isArray(stored) ? stored : [];
        setBookings(clean);
        await syncLocalToApi(clean);
      }
    } catch (e) {
      setError("تعذّر جلب البيانات");
    } finally {
      setLoading(false);
    }
  }, []);

  // Load from API directly
  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  async function manualSync() {
    setSyncing(true);
    try {
      await bookingSyncEngine.forceSync();
      await fetchBookings();
      alert("تمت المزامنة مع المخزن المركزي بنجاح.");
    } catch (error) {
      console.error('Manual sync failed:', error);
      alert("فشلت المزامنة. يرجى المحاولة مرة أخرى.");
    } finally {
      setSyncing(false);
    }
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

      <main className="container mx-auto p-6 flex-1 space-y-6">
        {/* Header مع مؤشر المزامنة الذكي */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                حجوزاتي
              </h1>
              <p className="text-gray-600 mt-1">
                إدارة حجوزاتك مع مزامنة ذكية فورية
              </p>
              <div className="mt-2">
                <InstantLink 
                  href="/dashboard/customer" 
                  className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                >
                  ← العودة إلى لوحة التحكم
                </InstantLink>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <SmartSyncIndicator />
              <div className="flex items-center gap-2">
                <button 
                  className="px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 rounded-lg border border-gray-300 transition-colors" 
                  onClick={refreshServer}
                >
                  تحديث
                </button>
                <button 
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50" 
                  onClick={manualSync} 
                  disabled={syncing}
                >
                  {syncing ? "جارٍ المزامنة…" : "مزامنة ذكية"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <div className="text-red-600 text-lg font-semibold mb-2">خطأ في تحميل البيانات</div>
            <p className="text-red-500">{error}</p>
          </div>
        ) : (
          <>
            {/* الحجوزات الرئيسية */}
            <section className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-slate-50 to-gray-50 px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">حجوزاتي</h2>
                  <div className="text-sm text-gray-600">
                    {bookings.length} حجز
                  </div>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-gray-50 to-slate-50 border-b border-gray-200">
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">رقم الحجز</th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">العقار</th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">العميل</th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">بداية</th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">المدة</th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">المبلغ</th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">الحالة</th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {bookings.map((b) => (
                      <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono font-medium text-gray-900">
                          {b.bookingNumber}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-medium text-gray-900">{b.propertyTitle || "-"}</span>
                            <span className="text-xs text-gray-500">{b.propertyReference || "-"}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-sm text-gray-900">{b.customerInfo?.name || "-"}</span>
                            <span className="text-xs text-gray-500">{b.customerInfo?.phone || "-"}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {toDate(b.startDate)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {b.duration} شهر
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                          {fmtOMR(b.totalAmount || 0)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            b.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            b.status === 'reserved' ? 'bg-blue-100 text-blue-800' :
                            b.status === 'leased' ? 'bg-green-100 text-green-800' :
                            b.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                            b.status === 'accounting' ? 'bg-purple-100 text-purple-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {statusLabel(b.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2 rtl:space-x-reverse">
                            <InstantLink 
                              href={`/admin/bookings/${encodeURIComponent(b.id)}`} 
                              className="inline-flex items-center px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium rounded-lg transition-colors"
                            >
                              عرض العقد
                            </InstantLink>
                            <InstantLink 
                              href={`/properties/${encodeURIComponent(b.propertyId)}`} 
                              className="inline-flex items-center px-3 py-1.5 bg-gray-500 hover:bg-gray-600 text-white text-xs font-medium rounded-lg transition-colors"
                            >
                              صفحة العقار
                            </InstantLink>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {bookings.length === 0 && (
                      <tr>
                        <td className="px-6 py-12 text-center text-gray-500" colSpan={8}>
                          <div className="flex flex-col items-center">
                            <div className="w-16 h-16 text-gray-300 mb-4">
                              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد حجوزات</h3>
                            <p className="text-gray-500">لم تقم بأي حجوزات بعد.</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              
              {missingOnServer.length > 0 && (
                <div className="bg-orange-50 border-t border-orange-200 px-6 py-3">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-orange-500 rounded-full ml-2"></div>
                    <span className="text-sm text-orange-700">
                      توجد {missingOnServer.length} حجوزات محلية غير موجودة على الخادم. اضغط "مزامنة ذكية".
                    </span>
                  </div>
                </div>
              )}
            </section>

          </>
        )}
      </main>

    </div>
  );
}
