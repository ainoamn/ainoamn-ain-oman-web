// src/pages/admin/invoices.tsx
import Head from "next/head";
import Layout from "@/components/layout/Layout";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

type Invoice = {
  id: string; serial: string; reservationId: string; propertyId: string; unitId?: string;
  currency: "OMR"; amount: number; status: "unpaid" | "paid" | "canceled";
  items: { title: string; qty: number; price: number; total: number }[];
  issuedAt: string; dueAt?: string; paidAt?: string;
};

const ALLOWED_ROLES = ["admin", "manager", "owner", "superadmin"];
function AdminInvoicesPage() {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [items, setItems] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const openId = typeof router.query.open === "string" ? router.query.open : "";

  // حارس عميل: يسمح بالدخول إن كان المستخدم مسجلاً بدور إداري
  useEffect(() => {
    let cancelled = false;

    const pass = () => { if (!cancelled) setAuthChecked(true); };
    const deny = () => {
      if (!cancelled) {
        const ret = router.asPath || "/admin/invoices";
        router.replace(`/login?return=${encodeURIComponent(ret)}`);
      }
    };

    (async () => {
      try {
        // 1) جرّب /api/auth/me
        const r = await fetch(process.env.NEXT_PUBLIC_AUTH_ME_ENDPOINT || "/api/auth/me", { credentials: "include" });
        if (r.ok) {
          const d = await r.json();
          const role = d?.user?.role || d?.user?.type || (d?.user?.isAdmin ? "admin" : undefined);
          if (role && ALLOWED_ROLES.includes(String(role).toLowerCase())) return pass();
        }
      } catch (_e) {}

      // 2) احتياطي: اقرأ من localStorage إن كان تطبيقك يحفظ الجلسة هناك
      try {
        const ls = typeof window !== "undefined"
          ? (localStorage.getItem("ain_auth") || localStorage.getItem("auth_token"))
          : null;
        if (ls) {
          const u = JSON.parse(ls);
          const role = u?.user?.role || u?.role || (u?.isAdmin ? "admin" : undefined);
          if (role && ALLOWED_ROLES.includes(String(role).toLowerCase())) return pass();
        }
      } catch (_e) {}

      deny();
    })();

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // تحميل الفواتير بعد اجتياز الحارس
  useEffect(() => {
    if (!authChecked) return;
    (async () => {
      setLoading(true);
      try {
        const r = await fetch("/api/invoices", { credentials: "include" });
        const j = await r.json().catch(() => ({}));
        setItems(Array.isArray(j?.items) ? j.items : []);
      } finally {
        setLoading(false);
      }
    })();
  }, [authChecked]);

  const setStatus = async (id: string, status: "unpaid" | "paid" | "canceled") => {
    const r = await fetch(`/api/invoices/${id}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
      credentials: "include",
    });
    if (!r.ok) alert("فشل التحديث");
    // أعد التحميل
    const rr = await fetch("/api/invoices", { credentials: "include" });
    const jj = await rr.json().catch(() => ({}));
    setItems(Array.isArray(jj?.items) ? jj.items : []);
  };

  // شاشة التحقق
  if (!authChecked) {
    return (
      <Layout>
        <Head><title>الفواتير</title></Head>
        <div className="max-w-6xl mx-auto p-4">جارٍ التحقق من الصلاحيات…</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Head><title>الفواتير</title></Head>
      <div className="max-w-6xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">الفواتير</h1>
        {loading ? (
          <div>جارٍ التحميل…</div>
        ) : (
          <div className="overflow-auto border rounded">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-2">#</th>
                  <th className="p-2">الرقم</th>
                  <th className="p-2">الحالة</th>
                  <th className="p-2">العقار/الوحدة</th>
                  <th className="p-2">الإجمالي</th>
                  <th className="p-2">أُصدر في</th>
                  <th className="p-2">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {items.map((it, i) => (
                  <tr key={it.id} className={`border-t ${openId && (it.id===openId || it.serial===openId) ? "bg-yellow-50" : ""}`}>
                    <td className="p-2">{i + 1}</td>
                    <td className="p-2">{it.serial}</td>
                    <td className="p-2">{it.status}</td>
                    <td className="p-2">#{it.propertyId}{it.unitId ? ` / ${it.unitId}` : ""}</td>
                    <td className="p-2">{it.amount} OMR</td>
                    <td className="p-2">{new Date(it.issuedAt).toLocaleString()}</td>
                    <td className="p-2 space-x-2 space-x-reverse">
                      <button onClick={() => setStatus(it.id, "paid")} className="px-2 py-1 rounded bg-emerald-600 text-white">تأشير مدفوع</button>
                      <button onClick={() => setStatus(it.id, "unpaid")} className="px-2 py-1 rounded bg-gray-500 text-white">غير مدفوع</button>
                      <button onClick={() => setStatus(it.id, "canceled")} className="px-2 py-1 rounded bg-rose-600 text-white">إلغاء</button>
                    </td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr><td className="p-3 text-center text-gray-500" colSpan={7}>لا توجد فواتير.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
}

// لا حارس SSR. اتركه فارغًا.
export const getServerSideProps = async () => ({ props: {} });
