// src/pages/admin/billing/invoices.tsx
import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { useTranslation } from "@/hooks/useTranslation";

type Invoice = {
  id: string;
  reservationId?: string;
  customerName?: string;
  amount: number;
  currency?: string;
  status: "unpaid" | "paid" | "pending";
  paidAt?: string | null;
};

async function runtimeListInvoices(): Promise<Invoice[]> {
  // يحاول استخدام عميلك إن وُجد، وإلا يسقط إلى REST
  try {
    const mod: any = await import("@/lib/billingClient");
    if (typeof mod.listInvoices === "function") return await mod.listInvoices();
  } catch (_e) {}
  try {
    const r = await fetch("/api/billing/invoices");
    const j = await r.json().catch(() => []);
    const arr = Array.isArray(j?.items) ? j.items : Array.isArray(j) ? j : [];
    return arr as Invoice[];
  } catch {
    return [];
  }
}

async function runtimePayInvoice(id: string, amount: number) {
  try {
    const mod: any = await import("@/lib/billingClient");
    if (typeof mod.payInvoice === "function") return await mod.payInvoice(id, amount, "cash");
  } catch (_e) {}
  await fetch("/api/billing/invoices/pay", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, amount, method: "cash" }),
  }).catch(() => {});
}
function InvoicesAdminPage() {
  const { t, dir } = useTranslation();
  const [items, setItems] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setErr(null);
    try {
      const data = await runtimeListInvoices();
      const norm: Invoice[] = (data || []).map((x: any) => ({
        id: String(x?.id),
        reservationId: x?.reservationId ?? x?.reservation_id ?? "-",
        customerName: x?.customerName ?? x?.customer_name ?? "-",
        amount: Number(x?.amount ?? 0),
        currency: x?.currency ?? "OMR",
        status: (x?.status as any) ?? "unpaid",
        paidAt: x?.paidAt ?? x?.paid_at ?? null,
      }));
      setItems(norm);
    } catch (e: any) {
      setErr(e?.message || "فشل التحميل");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  async function markPaid(id: string, amount: number) {
    await runtimePayInvoice(id, amount);
    await load();
  }

  const title = t("billing.invoices.title", "الفواتير");

  return (
    <AdminLayout>
      <Head><title>{title} | Ain Oman</title></Head>

      <div dir={dir} className="mx-auto max-w-7xl px-4 py-6">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
          <div className="flex items-center gap-2">
            <Link href="/admin/dashboard?section=invoices" className="rounded-xl border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-50">
              {t("common.dashboard", "لوحة التحكم")}
            </Link>
            <button onClick={load} className="rounded-xl border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-50">
              {t("common.refresh", "تحديث")}
            </button>
          </div>
        </div>

        {err ? (
          <div className="mb-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{err}</div>
        ) : null}

        {loading ? (
          <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
            {t("common.loading", "جارٍ التحميل...")}
          </div>
        ) : items.length === 0 ? (
          <div className="text-sm text-slate-500">{t("billing.invoices.empty", "لا توجد فواتير.")}</div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="p-2 text-start">#</th>
                  <th className="p-2 text-start">{t("billing.invoices.reservation", "الحجز")}</th>
                  <th className="p-2 text-start">{t("billing.invoices.customer", "العميل")}</th>
                  <th className="p-2 text-start">{t("billing.invoices.amount", "المبلغ")}</th>
                  <th className="p-2 text-start">{t("billing.invoices.status", "الحالة")}</th>
                  <th className="p-2 text-start">{t("billing.invoices.actions", "إجراءات")}</th>
                </tr>
              </thead>
              <tbody>
                {items.map((x) => (
                  <tr key={x.id} className="border-b last:border-b-0">
                    <td className="p-2">{x.id}</td>
                    <td className="p-2">{x.reservationId}</td>
                    <td className="p-2">{x.customerName}</td>
                    <td className="p-2">{x.amount} {x.currency}</td>
                    <td className="p-2">{x.status}</td>
                    <td className="p-2">
                      {x.status === "unpaid" ? (
                        <button
                          onClick={() => markPaid(x.id, x.amount)}
                          className="rounded-lg border border-emerald-300 px-2 py-1 text-xs hover:bg-emerald-50"
                        >
                          {t("billing.invoices.markCashPaid", "تأكيد الدفع نقدًا")}
                        </button>
                      ) : (
                        <span className="text-xs text-slate-500">
                          {x.paidAt ? new Date(x.paidAt).toLocaleString() : "—"}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
