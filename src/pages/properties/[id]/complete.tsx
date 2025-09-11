import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Layout from "@/components/layout/Layout";

export default function CompleteLeasePage() {
  const router = useRouter();
  const { id, bookingId } = router.query as { id?: string; bookingId?: string };

  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const finalize = async () => {
    if (!id || !bookingId) return;
    setBusy(true); setErr(null);
    try {
      // 1) تأكيد الحجز
      const r1 = await fetch(`/api/bookings/${encodeURIComponent(String(bookingId))}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "confirm" }),
      });
      if (!r1.ok) throw new Error("فشل تأكيد الحجز");

      // 2) تحديث حالة العقار إلى rented
      const r2 = await fetch(`/api/properties/${encodeURIComponent(String(id))}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "rented" }),
      });
      if (!r2.ok) throw new Error("فشل تحديث حالة العقار");

      router.replace(`/properties/${encodeURIComponent(String(id))}/bookings`);
    } catch (e:any) {
      setErr(e?.message || "تعذّر الإنهاء");
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => { if (id && bookingId) finalize(); }, [id, bookingId]);

  return (
    <Layout>
      <Head><title>إكمال عقد الإيجار | Ain Oman</title></Head>
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-xl p-6">
          {err ? <div className="text-rose-700 bg-rose-50 border border-rose-200 rounded p-3 text-sm">{err}</div> : null}
          <div className="text-slate-600">جاري الإنهاء...</div>
        </div>
      </main>
    </Layout>
  );
}
