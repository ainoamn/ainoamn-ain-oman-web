// src/pages/admin/reservations.tsx
import Head from "next/head";
import Layout from "@/components/layout/Layout";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

type Reservation = {
  id: string;
  propertyId: string;
  unitId?: string;
  name: string;
  phone: string;
  startDate: string;
  periodMonths?: number;
  periodDays?: number;
  createdAt: string;
  status?: "pending" | "approved" | "rejected";
  invoiceId?: string;
};

const ALLOWED_ROLES = ["admin", "manager", "owner", "superadmin"] as const;
function AdminReservationsPage() {
  const router = useRouter();

  // حارس عميل
  const [authChecked, setAuthChecked] = useState(false);

  // بيانات الصفحة
  const [items, setItems] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  // حارس: لا تحويل إلا إذا كانت الاستجابة 401/403
  useEffect(() => {
    let cancelled = false;

    const pass = () => { if (!cancelled) setAuthChecked(true); };
    const deny = () => {
      if (!cancelled) {
        const ret = router.asPath || "/admin/reservations";
        router.replace(`/login?return=${encodeURIComponent(ret)}`);
      }
    };

    (async () => {
      try {
        const endpoint = process.env.NEXT_PUBLIC_AUTH_ME_ENDPOINT || "/api/auth/me";
        const r = await fetch(endpoint, { credentials: "include" });

        if (r.status === 401 || r.status === 403) {
          return deny();
        }

        if (r.ok) {
          const d = await r.json().catch(() => null);
          const role: string | undefined =
            d?.user?.role || d?.user?.type || (d?.user?.isAdmin ? "admin" : undefined);

          // إن عاد 200 لكن الدور غير إداري اعتبره رفضًا
          if (!role || !ALLOWED_ROLES.includes(role.toLowerCase() as any)) {
            return deny();
          }
          return pass();
        }

        // أي حالة أخرى: اسمح بالمتابعة لمنع حلقة التحويل
        return pass();
      } catch {
        // أخطاء شبكة: اسمح بالمتابعة لمنع حلقة التحويل
        return pass();
      }
    })();

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // تحميل البيانات بعد اجتياز الحارس
  useEffect(() => {
    if (!authChecked) return;
    (async () => {
      setLoading(true);
      try {
        const r = await fetch("/api/reservations", { credentials: "include" });
        const j = await r.json().catch(() => ({}));
        setItems(Array.isArray(j?.items) ? j.items : []);
      } finally {
        setLoading(false);
      }
    })();
  }, [authChecked]);

  const reload = async () => {
    const r = await fetch("/api/reservations", { credentials: "include" });
    const j = await r.json().catch(() => ({}));
    setItems(Array.isArray(j?.items) ? j.items : []);
  };

  const setStatus = async (id: string, status: "approved" | "rejected") => {
    const r = await fetch(`/api/reservations/${id}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
      credentials: "include",
    });
    if (!r.ok) alert("فشل التحديث");
    await reload();
  };

  // شاشة انتظار أثناء التحقق
  if (!authChecked) {
    return (
      <Layout>
        <Head><title>إدارة الحجوزات</title></Head>
        <div className="max-w-5xl mx-auto p-4">جارٍ التحقق من الصلاحيات…</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Head><title>إدارة الحجوزات</title></Head>
      <div className="max-w-5xl mx-auto p-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">الحجوزات</h1>
          <button onClick={reload} className="px-3 py-2 rounded border text-sm">تحديث</button>
        </div>

        {loading ? (
          <div>جارٍ التحميل…</div>
        ) : (
          <div className="overflow-auto border rounded">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-2 text-right">#</th>
                  <th className="p-2 text-right">الحالة</th>
                  <th className="p-2 text-right">العقار/الوحدة</th>
                  <th className="p-2 text-right">العميل</th>
                  <th className="p-2 text-right">تاريخ البدء / المدة</th>
                  <th className="p-2 text-right">فاتورة</th>
                  <th className="p-2 text-right">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {items.map((it, i) => (
                  <tr key={it.id} className="border-t">
                    <td className="p-2">{i + 1}</td>
                    <td className="p-2">{it.status || "-"}</td>
                    <td className="p-2">
                      #{it.propertyId}{it.unitId ? ` / ${it.unitId}` : ""}
                    </td>
                    <td className="p-2">{it.name} — {it.phone}</td>
                    <td className="p-2">
                      {it.startDate} —{" "}
                      {it.periodMonths
                        ? `${it.periodMonths} شهر`
                        : it.periodDays
                        ? `${it.periodDays} يوم`
                        : "-"}
                    </td>
                    <td className="p-2">
                      {it.invoiceId ? (
                        <a className="underline" href={`/admin/invoices?open=${encodeURIComponent(it.invoiceId)}`}>
                          {it.invoiceId}
                        </a>
                      ) : "-"}
                    </td>
                    <td className="p-2 space-x-2 space-x-reverse">
                      <button onClick={() => setStatus(it.id, "approved")} className="px-2 py-1 rounded bg-emerald-600 text-white">
                        موافقة
                      </button>
                      <button onClick={() => setStatus(it.id, "rejected")} className="px-2 py-1 rounded bg-rose-600 text-white">
                        رفض
                      </button>
                    </td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr>
                    <td className="p-3 text-center text-gray-500" colSpan={7}>لا توجد حجوزات.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
}

// لا حارس SSR لمنع حلقة التحويل
export const getServerSideProps = async () => ({ props: {} });
