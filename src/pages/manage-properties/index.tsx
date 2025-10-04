// src/pages/manage-properties/index.tsx
import Head from "next/head";
import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";
import Layout from "@/components/layout/Layout";

type Item = {
  id: string;
  referenceNo?: string;
  title?: { ar?: string; en?: string };
  priceOMR?: number;
  province?: string; state?: string; village?: string;
  published?: boolean;
  createdAt?: string;
  status?: "vacant" | "reserved" | "leased" | "hidden" | "draft";
};

export default function ManageProperties() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // دالة جلب مع إلغاء الكاش
  const fetchList = useCallback(() => {
    setLoading(true);
    fetch(`/api/properties?_ts=${Date.now()}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setItems(Array.isArray(d?.items) ? d.items : []))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    // الجلب الأولي (الكود الأصلي)
    setLoading(true);
    fetch("/api/properties")
      .then((r) => r.json())
      .then((d) => setItems(Array.isArray(d?.items) ? d.items : []))
      .finally(() => setLoading(false));
  }, []);

  // إعادة الجلب عند اكتمال أي تنقل أو عند عودة التبويب
  useEffect(() => {
    const onRoute = () => fetchList();
    const onVis = () => { if (document.visibilityState === "visible") fetchList(); };
    try { router.events.on("routeChangeComplete", onRoute); } catch {}
    document.addEventListener("visibilitychange", onVis);
    // محاولة تحديث فوري عند الوصول
    if (typeof document !== "undefined" && document.visibilityState === "visible") fetchList();
    return () => {
      try { router.events.off("routeChangeComplete", onRoute); } catch {}
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [router.events, fetchList]);

  const togglePublish = async (id: string, published: boolean) => {
    const cur = items.find((x) => x.id === id);
    if (!cur) return;
    const r = await fetch(`/api/properties/${encodeURIComponent(id)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...cur, published: !published }),
    });
    if (r.ok) {
      setItems((prev) => prev.map((x) => (x.id === id ? { ...x, published: !published } : x)));
    }
  };

  const getStatusText = (status: string | undefined) => {
    switch (status) {
      case "vacant": return "شاغر";
      case "reserved": return "محجوز";
      case "leased": return "مؤجر";
      case "hidden": return "مخفي";
      case "draft": return "مسودة";
      default: return "غير معروف";
    }
  };

  const getStatusColor = (status: string | undefined) => {
    switch (status) {
      case "vacant": return "bg-green-100 text-green-800";
      case "reserved": return "bg-blue-100 text-blue-800";
      case "leased": return "bg-purple-100 text-purple-800";
      case "hidden": return "bg-gray-100 text-gray-800";
      case "draft": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Layout>
      <Head><title>إدارة عقاراتي | Ain Oman</title></Head>
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">لوحة إدارة عقاراتي</h1>
            <Link href="/properties/new" className="px-4 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700">+ إضافة عقار</Link>
          </div>

          {loading ? (
            <div className="text-gray-500">جارٍ التحميل...</div>
          ) : (
            <div className="overflow-x-auto bg-white border border-gray-200 rounded-2xl">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-3 text-right">المرجع</th>
                    <th className="p-3 text-right">العنوان</th>
                    <th className="p-3 text-right">الموقع</th>
                    <th className="p-3 text-right">السعر (OMR)</th>
                    <th className="p-3 text-right">الحالة</th>
                    <th className="p-3 text-right">حالة النشر</th>
                    <th className="p-3 text-right">الإجراء</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((p) => (
                    <tr key={p.id} className="border-t">
                      <td className="p-3 whitespace-nowrap">{p.referenceNo || "—"}</td>
                      <td className="p-3">{p.title?.ar || p.title?.en || `#${p.id}`}</td>
                      <td className="p-3 text-gray-600">{[p.province, p.state, p.village].filter(Boolean).join(" - ")}</td>
                      <td className="p-3">{typeof p.priceOMR === "number" ? p.priceOMR.toFixed(3) : "—"}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(p.status)}`}>
                          {getStatusText(p.status)}
                        </span>
                      </td>
                      <td className="p-3">{p.published ? "منشور" : "مسودة"}</td>
                      <td className="p-3 space-x-2 space-x-reverse">
                        <Link href={`/properties/new?edit=${encodeURIComponent(p.id)}`} className="px-3 py-1 rounded-lg bg-blue-600 text-white hover:bg-blue-700">
                          تحرير
                        </Link>
                        <button onClick={() => togglePublish(p.id, !!p.published)} className="px-3 py-1 rounded-lg bg-slate-700 text-white hover:bg-slate-800">
                          {p.published ? "إلغاء النشر" : "نشر"}
                        </button>
                        <Link href={`/properties/${encodeURIComponent(p.id)}`} className="px-3 py-1 rounded-lg bg-gray-200 hover:bg-gray-300">
                          عرض
                        </Link>
                        <Link href={`/properties/${encodeURIComponent(p.id)}/bookings`} className="px-3 py-1 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">
                          الحجوزات
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </Layout>
  );
}