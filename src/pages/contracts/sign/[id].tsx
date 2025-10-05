// src/pages/contracts/sign/[id].tsx
import Head from "next/head";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type Booking = {
  id: string;
  bookingNumber: string;
  startDate: string;
  endDate?: string;
  durationMonths: number;
  status: string;
  contractSnapshot?: {
    templateName: string;
    bodyAr: string;
    bodyEn: string;
    fields: Record<string, string>;
  };
};

function render(body: string, fields: Record<string, string>) {
  let out = body || "";
  Object.entries(fields || {}).forEach(([k, v]) => {
    out = out.replace(new RegExp(`{{\\s*${k}\\s*}}`, "g"), String(v || ""));
  });
  return out;
}

export default function SignContractPage() {
  const { query } = useRouter();
  const raw = String(Array.isArray(query.id) ? query.id[0] : query.id || "");
  const [id, setId] = useState<string>("");
  const [b, setB] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [agree, setAgree] = useState(false);

  useEffect(() => {
    if (!raw) return;
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        // جرّب كمعرّف مباشر
        let r = await fetch(`/api/bookings/${encodeURIComponent(raw)}`);
        let d: any = r.ok ? await r.json() : null;

        // إن لم يوجد، جرّب بالبحث برقم الحجز عبر /api/bookings?number=
        if (!d?.item) {
          const rr = await fetch(`/api/bookings?number=${encodeURIComponent(raw)}`);
          const dj = rr.ok ? await rr.json() : null;
          const item = Array.isArray(dj?.items)
            ? dj.items.find((x: any) => x.bookingNumber === raw || x.id === raw)
            : null;
          d = item ? { item } : null;
        }

        if (!d?.item) throw 0;
        setB(d.item);
        setId(d.item.id);
      } catch {
        setErr("تعذّر جلب البيانات");
      } finally {
        setLoading(false);
      }
    })();
  }, [raw]);

  const ar = useMemo(() => render(b?.contractSnapshot?.bodyAr || "", b?.contractSnapshot?.fields || {}), [b]);
  const en = useMemo(() => render(b?.contractSnapshot?.bodyEn || "", b?.contractSnapshot?.fields || {}), [b]);

  async function sign() {
    if (!id || !agree) return;
    const r = await fetch(`/api/bookings/${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action: "tenantSign" }),
    });
    if (r.ok) {
      const bookingNumber = b?.bookingNumber || id;
      window.location.href = `/admin/accounting/review/${encodeURIComponent(bookingNumber)}`;
    } else {
      alert("فشل توقيع العقد");
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Head>
        <title>توقيع العقد</title>
      </Head>
      <Header />
      <main className="container mx-auto p-4 flex-1 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">توقيع العقد #{b?.bookingNumber || raw}</h1>
          <Link href="/dashboard" className="btn">
            لوحة التحكم
          </Link>
        </div>

        {loading ? (
          <div>جارٍ التحميل…</div>
        ) : err ? (
          <div className="text-red-600">{err}</div>
        ) : b ? (
          <>
            <section className="border rounded-2xl p-3 space-y-2">
              <div className="font-semibold">النص العربي</div>
              <div className="text-sm whitespace-pre-wrap">{ar}</div>
            </section>
            <section className="border rounded-2xl p-3 space-y-2">
              <div className="font-semibold">English Text</div>
              <div className="text-sm whitespace-pre-wrap">{en}</div>
            </section>

            <label className="flex items-center gap-2">
              <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
              أقر أني قرأت البنود كاملة وأوافق على العقد
            </label>
            <button className="btn btn-primary" onClick={sign} disabled={!agree}>
              توقيع
            </button>
          </>
        ) : (
          <div>لا يوجد عقد.</div>
        )}
      </main>
      <Footer />
    </div>
  );
}
