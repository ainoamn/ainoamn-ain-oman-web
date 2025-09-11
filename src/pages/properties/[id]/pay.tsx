import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Layout from "@/components/layout/Layout";

type Property = {
  id: string;
  title?: string | { ar?: string; en?: string };
  priceOMR?: number;
  purpose?: "sale" | "rent" | "investment" | string;
  rentalType?: "daily" | "monthly" | "yearly" | null | string;
};

function titleToText(t?: Property["title"]) {
  if (!t) return "";
  return typeof t === "string" ? t : (t.ar || t.en || "");
}

export default function MockPayPage() {
  const router = useRouter();
  const { id } = router.query;
  const pid = Array.isArray(id) ? id[0] : id;

  const [prop, setProp] = useState<Property | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // نموذج دفع وهمي
  const [cardName, setCardName] = useState("");
  const [cardNo, setCardNo] = useState("");
  const [exp, setExp] = useState("");
  const [cvv, setCvv] = useState("");

  useEffect(() => {
    if (!pid) return;
    fetch(`/api/properties/${encodeURIComponent(String(pid))}`)
      .then(r => r.json())
      .then(d => setProp(d?.item || null))
      .catch(() => setProp(null));
  }, [pid]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pid) return;
    setErr(null);
    setBusy(true);
    try {
      // 1) إنشاء حجز بحالة awaiting_payment
      const create = await fetch(`/api/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId: String(pid),
          start: new Date().toISOString().slice(0, 10),
          months: 12,
          note: "Mock payment",
          amountOMR: Number(prop?.priceOMR || 0),
          status: "awaiting_payment",
        }),
      });
      const bj = await create.json();
      if (!create.ok) throw new Error(bj?.error || "فشل إنشاء الحجز");

      const bookingId = bj?.id || bj?.booking?.id;

      // 2) محاكاة قبول الدفع وتبديل حالة الحجز إلى pending
      const paid = await fetch(`/api/bookings/${encodeURIComponent(String(bookingId))}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "mark_paid" }),
      });
      if (!paid.ok) throw new Error("فشل تحديث حالة الحجز بعد الدفع");

      // 3) تحديث حالة العقار إلى reserved
      await fetch(`/api/properties/${encodeURIComponent(String(pid))}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "reserved" }),
      });

      // 4) تحويل المستخدم إلى صفحة حجوزات العقار
      router.replace(`/properties/${encodeURIComponent(String(pid))}/bookings`);
    } catch (e:any) {
      setErr(e?.message || "تعذّر إتمام العملية");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Layout>
      <Head><title>الدفع | Ain Oman</title></Head>
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-xl p-6">
          <h1 className="text-2xl font-bold mb-4">الدفع لحجز العقار</h1>

          <div className="bg-white rounded-2xl shadow p-4 mb-4">
            <div className="text-sm text-slate-600">العقار</div>
            <div className="font-semibold">{titleToText(prop?.title) || `#${pid}`}</div>
            <div className="text-sm text-slate-600">
              المبلغ المستحق: {(prop?.priceOMR ?? 0).toFixed(3)} OMR
            </div>
          </div>

          {err && <div className="mb-4 text-rose-700 bg-rose-50 border border-rose-200 rounded p-3 text-sm">{err}</div>}

          <form onSubmit={submit} className="bg-white rounded-2xl shadow p-6 space-y-4">
            <div>
              <label className="text-sm block mb-1">اسم حامل البطاقة</label>
              <input className="border rounded-lg p-2 w-full" required value={cardName} onChange={(e)=>setCardName(e.target.value)} />
            </div>
            <div>
              <label className="text-sm block mb-1">رقم البطاقة</label>
              <input className="border rounded-lg p-2 w-full" required value={cardNo} onChange={(e)=>setCardNo(e.target.value)} placeholder="4111 1111 1111 1111" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm block mb-1">تاريخ الانتهاء</label>
                <input className="border rounded-lg p-2 w-full" required value={exp} onChange={(e)=>setExp(e.target.value)} placeholder="MM/YY" />
              </div>
              <div>
                <label className="text-sm block mb-1">CVV</label>
                <input className="border rounded-lg p-2 w-full" required value={cvv} onChange={(e)=>setCvv(e.target.value)} />
              </div>
            </div>
            <button disabled={busy} className="w-full px-4 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60">
              {busy ? "جارِ المعالجة..." : "ادفع الآن"}
            </button>
            <p className="text-xs text-slate-500">الدفع وهمي للاختبار. سنستبدله ببوابة رسمية لاحقًا.</p>
          </form>
        </div>
      </main>
    </Layout>
  );
}
