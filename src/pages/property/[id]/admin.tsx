import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  getProperty,
  createTaskForProperty,
  referToLegal,
  createInvoiceForProperty,
} from "@/lib/api/propertiesCrud";

type T = any;

export default function PropertyAdmin() {
  const router = useRouter();
  const id = String(router.query.id || "");
  const [item, setItem] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getProperty(id)
      .then((p) => setItem(p))
      .catch((e) => setErr(String(e?.message || e)))
      .finally(() => setLoading(false));
  }, [id]);

  const title = useMemo(() => {
    if (item?.title) {
      if (typeof item.title === 'string') return item.title;
      if (typeof item.title === 'object' && item.title.ar) return item.title.ar;
      if (typeof item.title === 'object' && item.title.en) return item.title.en;
    }
    return item?.referenceNo || id;
  }, [item, id]);

  async function quickTask() {
    const i = prompt("عنوان المهمة؟");
    if (!i) return;
    await createTaskForProperty(id, { title: i, status: "open" });
    alert("تم إنشاء المهمة وربطها بالعقار");
    router.push(`/tasks?propertyId=${encodeURIComponent(id)}`);
  }

  async function quickLegal() {
    const t = prompt("عنوان القضية/الإحالة؟");
    if (!t) return;
    await referToLegal(id, { title: t, status: "OPEN", stage: "NEW" });
    alert("تم إحالة العقار إلى النظام القانوني");
    router.push(`/legal?propertyId=${encodeURIComponent(id)}`);
  }

  async function quickInvoice() {
    const totalStr = prompt("المبلغ الإجمالي للفاتورة؟");
    if (!totalStr) return;
    const total = Number(totalStr);
    if (!Number.isFinite(total)) return alert("قيمة غير صالحة");
    await createInvoiceForProperty(id, { kind: "service", total, currency: "OMR", paid: false });
    alert("تم إنشاء الفاتورة وربطها بالعقار");
    router.push(`/billing/invoices?propertyId=${encodeURIComponent(id)}`);
  }

  if (!id) return <div className="p-6">لا يوجد معرف عقار</div>;
  if (loading) return <div className="p-6">جار التحميل…</div>;
  if (err) return <div className="p-6 text-red-600">خطأ: {err}</div>;
  if (!item) return <div className="p-6">غير موجود</div>;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">إدارة العقار: {title}</h1>
        <Link href={`/property/${encodeURIComponent(id)}`} className="underline">
          عرض صفحة العقار
        </Link>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <button onClick={quickTask} className="px-4 py-3 rounded-xl shadow border">
          + مهمة مرتبطة
        </button>
        <button onClick={quickLegal} className="px-4 py-3 rounded-xl shadow border">
          إحالة للمحاماة
        </button>
        <button onClick={quickInvoice} className="px-4 py-3 rounded-xl shadow border">
          إنشاء فاتورة مرتبطة
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Section
          title="المهام"
          links={[
            { href: `/tasks?propertyId=${id}`, label: "كل المهام" },
            { href: `/tasks/new?propertyId=${id}`, label: "مهمة جديدة" },
          ]}
        />
        <Section
          title="القضايا القانونية"
          links={[
            { href: `/legal?propertyId=${id}`, label: "كل القضايا" },
            { href: `/legal/new?propertyId=${id}`, label: "قضية جديدة" },
          ]}
        />
        <Section
          title="الفوترة والحسابات"
          links={[
            { href: `/billing/invoices?propertyId=${id}`, label: "فواتير العقار" },
          ]}
        />
        <Section
          title="المستندات"
          links={[
            { href: `/property/${id}/documents`, label: "مستندات العقار" },
            { href: `/legal/upload?propertyId=${id}`, label: "رفع مستند قانوني" },
          ]}
        />
        <Section
          title="الطلبات والحجوزات"
          links={[
            { href: `/manage-requests?propertyId=${id}`, label: "طلبات الإدارة" },
            { href: `/reservations?propertyId=${id}`, label: "الحجوزات" },
          ]}
        />
      </div>
    </div>
  );
}

function Section({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <div className="rounded-2xl border p-4 shadow-sm">
      <h2 className="font-semibold mb-3">{title}</h2>
      <ul className="space-y-2">
        {links.map((l) => (
          <li key={l.href}>
            <a className="underline" href={l.href}>{l.label}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}
