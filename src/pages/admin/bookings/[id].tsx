// src/pages/admin/bookings/[id].tsx
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { FaCheck, FaTimes, FaPrint, FaArrowRight } from "react-icons/fa";

/* ===== Types aligned with API ===== */
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

type Property = {
  id: string;
  referenceNo?: string;
  title?: string | { ar?: string; en?: string };
  description?: string | { ar?: string; en?: string };
  images?: string[];
  coverIndex?: number;
  coverImage?: string;
  priceOMR?: number;
  province?: string;
  state?: string;
  village?: string;
  type?: string;
  purpose?: string;
  rentalType?: string | null;
  status?: "vacant" | "reserved" | "hidden" | "draft";
  published?: boolean;
  createdAt?: string | null;
  updatedAt?: string | null;
};

type Payment = { id: string; bookingId: string; amount: number; method?: string; paidAt: string; meta?: any };

/* ===== Helpers ===== */
function tTitle(t?: Property["title"]) {
  if (!t) return "";
  return typeof t === "string" ? t : (t.ar || t.en || "");
}
function coverUrl(p?: Property) {
  if (!p) return "";
  if (p.coverImage) return p.coverImage;
  if (Array.isArray(p.images) && p.images.length) {
    const i = typeof p.coverIndex === "number" ? p.coverIndex : 0;
    return p.images[i] || p.images[0];
  }
  return "";
}
function fmtMoney(n: number | undefined) {
  const v = Number(n || 0);
  return new Intl.NumberFormat("ar-OM", { style: "currency", currency: "OMR", maximumFractionDigits: 3 }).format(v);
}
function statusLabel(s?: BookingStatus) {
  if (s === "reserved") return "محجوز";
  if (s === "leased") return "مؤجّر";
  if (s === "cancelled") return "ملغى";
  return "قيد المراجعة";
}
function ownerDecisionLabel(d?: { approved?: boolean; reason?: string; decidedAt?: string } | null) {
  if (!d || d.approved === undefined) return "لم يُبتّ";
  if (d.approved) return "معتمد";
  return d.reason ? `مرفوض - ${d.reason}` : "مرفوض";
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
function toDateTime(s?: string) {
  if (!s) return "-";
  try {
    const d = new Date(s);
    return d.toLocaleString("ar-OM", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
  } catch {
    return s;
  }
}

/* ===== Page ===== */
export default function AdminBookingDetailsPage() {
  const router = useRouter();
  const { id } = router.query;
  const bid = Array.isArray(id) ? id[0] : id;

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [booking, setBooking] = useState<Booking | null>(null);
  const [property, setProperty] = useState<Property | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (!bid) return;
    setLoading(true);
    setErr(null);

    (async () => {
      try {
        // booking
        const br = await fetch(`/api/bookings/${encodeURIComponent(String(bid))}`);
        if (!br.ok) throw new Error("booking");
        const bdata = await br.json();
        const b: Booking = bdata?.item;
        setBooking(b || null);

        // property
        if (b?.propertyId) {
          const pr = await fetch(`/api/properties/${encodeURIComponent(String(b.propertyId))}`);
          if (pr.ok) {
            const pdata = await pr.json();
            setProperty(pdata?.item || null);
          }
        }

        // payments
        const pay = await fetch(`/api/payments`);
        if (pay.ok) {
          const ps: Payment[] = await pay.json();
          setPayments(ps.filter((x) => x.bookingId === b?.id));
        }
      } catch {
        setErr("تعذّر جلب البيانات");
      } finally {
        setLoading(false);
      }
    })();
  }, [bid]);

  const cover = useMemo(() => coverUrl(property), [property]);
  const addr = useMemo(() => [property?.province, property?.state, property?.village].filter(Boolean).join(" - "), [property]);

  async function approve() {
    if (!bid) return;
    const r = await fetch(`/api/bookings/${encodeURIComponent(String(bid))}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action: "approveContract" }),
    });
    if (r.ok) {
      const d = await r.json();
      setBooking(d?.item || null);
      // Redirect to approved contract page
      window.location.href = `/admin/contracts/${encodeURIComponent(String(bid))}`;
    } else alert("فشل الاعتماد");
  }

  async function reject() {
    if (!bid) return;
    if (!reason.trim()) return alert("اكتب سبب الرفض");
    const r = await fetch(`/api/bookings/${encodeURIComponent(String(bid))}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action: "rejectContract", reason }),
    });
    if (r.ok) {
      const d = await r.json();
      setBooking(d?.item || null);
      alert("تم رفض العقد");
    } else alert("فشل الرفض");
  }

  function printPage() {
    window.print();
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Head><title>مراجعة العقد</title></Head>
      <Header />

      <main className="container mx-auto p-4 flex-1 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">مراجعة العقد</h1>
          <div className="flex items-center gap-2">
            <Link href="/dashboard" className="btn">لوحة التحكم</Link>
            <button className="btn btn-outline" onClick={printPage}><FaPrint /> طباعة</button>
          </div>
        </div>

        {loading ? (
          <div>جارٍ التحميل…</div>
        ) : err ? (
          <div className="text-red-600">{err}</div>
        ) : booking ? (
          <div className="grid lg:grid-cols-3 gap-4">
            {/* Left: Property card */}
            <section className="lg:col-span-1 border rounded-2xl overflow-hidden">
              {cover ? (
                <img src={cover} className="w-full h-40 object-cover" alt="" />
              ) : (
                <div className="w-full h-40 bg-gray-100" />
              )}
              <div className="p-3 space-y-1">
                <div className="text-sm text-gray-600">{property?.referenceNo}</div>
                <div className="font-semibold">{tTitle(property?.title)}</div>
                <div className="text-sm text-gray-600">{addr}</div>
                <div className="font-bold">{fmtMoney(property?.priceOMR)}</div>
                <div className="text-xs text-gray-600">
                  حالة العقار:{" "}
                  {property?.status === "reserved"
                    ? "محجوز"
                    : property?.status === "vacant"
                    ? "شاغر"
                    : property?.status === "hidden"
                    ? "مخفي"
                    : "مسودة"}
                </div>
                <Link href={`/properties/${encodeURIComponent(String(property?.id || ""))}`} className="btn btn-outline mt-2">
                  عرض صفحة العقار
                </Link>
              </div>
            </section>

            {/* Middle: Contract preview */}
            <section className="lg:col-span-2 border rounded-2xl p-3 space-y-3">
              <div className="flex items-center justify-between">
                <div className="font-semibold">تفاصيل العقد</div>
                <span className="px-2 py-1 text-xs rounded bg-gray-100">
                  {statusLabel(booking.status)}
                </span>
              </div>

              <div className="grid sm:grid-cols-2 gap-2 text-sm">
                <Info label="رقم الحجز" value={booking.bookingNumber} />
                <Info label="العميل" value={booking.customerInfo?.name} />
                <Info label="هاتف" value={booking.customerInfo?.phone} />
                <Info label="بريد" value={booking.customerInfo?.email || "-"} />
                <Info label="بداية العقد" value={toDate(booking.startDate)} />
                <Info label="المدة (أشهر)" value={String(booking.duration)} />
                <Info label="القيمة الإجمالية" value={fmtMoney(booking.totalAmount)} />
                <Info label="توقيع المستأجر" value={booking.contractSigned ? "موقّع" : "غير موقّع"} />
                <Info label="قرار المالك" value={ownerDecisionLabel(booking.ownerDecision)} />
              </div>

              <div className="border rounded-lg p-3 text-sm max-h-64 overflow-auto bg-gray-50">
                <ContractBody property={property} booking={booking} />
              </div>

              {/* Payments */}
              <div className="space-y-2">
                <div className="font-semibold">المدفوعات</div>
                {payments.length ? (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left border-b">
                        <th className="py-1">التاريخ</th>
                        <th className="py-1">الطريقة</th>
                        <th className="py-1">المبلغ</th>
                        <th className="py-1">المعرف</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map((p) => (
                        <tr key={p.id} className="border-b last:border-0">
                          <td className="py-1">{toDateTime(p.paidAt)}</td>
                          <td className="py-1">{p.method || "-"}</td>
                          <td className="py-1">{fmtMoney(p.amount)}</td>
                          <td className="py-1">{p.id}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="text-sm text-gray-600">لا توجد مدفوعات مسجلة.</div>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <button className="btn btn-primary inline-flex items-center gap-2" onClick={approve}>
                    <FaCheck /> اعتماد العقد
                  </button>
                  <button className="btn btn-outline inline-flex items-center gap-2" onClick={printPage}>
                    <FaPrint /> طباعة العقد
                  </button>
                </div>
                <div className="grid sm:grid-cols-4 gap-2">
                  <input
                    className="form-input sm:col-span-3"
                    placeholder="سبب الرفض"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                  />
                  <button className="btn btn-danger inline-flex items-center gap-2" onClick={reject}>
                    <FaTimes /> رفض العقد
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <Link href="/admin/bookings" className="inline-flex items-center gap-2 text-sm text-teal-700">
                  <FaArrowRight className="rotate-180" /> الرجوع إلى قائمة الحجوزات
                </Link>
              </div>
            </section>
          </div>
        ) : (
          <div className="text-gray-600">لا يوجد حجز بهذا المعرف.</div>
        )}
      </main>

      <Footer />
    </div>
  );
}

/* ===== UI bits ===== */
function Info({ label, value }: { label: string; value?: string }) {
  return (
    <div className="border rounded-lg p-2 bg-white">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="font-medium">{value || "-"}</div>
    </div>
  );
}

function ContractBody({ property, booking }: { property: Property | null; booking: Booking }) {
  const pTitle = tTitle(property?.title);
  const addr = [property?.province, property?.state, property?.village].filter(Boolean).join(" - ");
  return (
    <div className="space-y-2 leading-relaxed">
      <p>
        يقر الطرفان بأن هذا العقد مبرم بشأن: <strong>{pTitle || "عقار"}</strong>، العنوان: {addr || "-"}، الرقم المرجعي:{" "}
        {property?.referenceNo || "-"}.
      </p>
      <p>
        مدة الإيجار: <strong>{booking.duration}</strong> شهرًا، تبدأ في <strong>{toDate(booking.startDate)}</strong>
        {booking.endDate ? <> وتنتهي في <strong>{toDate(booking.endDate)}</strong></> : null}. القيمة الإجمالية:{" "}
        <strong>{fmtMoney(booking.totalAmount)}</strong>.
      </p>
      <p>يلتزم المستأجر بسداد المستحقات في مواعيدها والمحافظة على سلامة العين المؤجرة وعدم إجراء تعديلات دون موافقة خطية.</p>
      <p>يحق للمؤجر إنهاء العقد عند مخالفة الشروط أو التأخر في السداد وفق القوانين المعمول بها.</p>
      <p>هذا نص نموذجي قابل للتبديل بنص العقد النهائي أو مستند PDF مرفوع.</p>
    </div>
  );
}
