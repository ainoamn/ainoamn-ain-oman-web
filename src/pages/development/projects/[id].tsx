// @ts-nocheck
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";

type Unit = { id: string; type: string; area?: number; bedrooms?: number; bathrooms?: number; priceBase?: number; currencyBase?: string; status?: string; };
type Project = {
  id: string; title: string; city?: string; status?: string; deliveryDate?: string;
  description?: string; amenities?: string[]; milestones?: { id: string; name: string; dueAt?: string; progress?: number }[];
  units?: Unit[];
};

export default function ProjectDetailsPage() {
  const { query } = useRouter();
  const id = String(query.id || "");
  const [item, setItem] = useState<Project | null>(null);
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!id) return;
    setLoading(true);
    const r = await fetch(`/api/development/projects/${id}`, { cache: "no-store" });
    const j = await r.json();
    setItem(j?.item || null);
    const ru = await fetch(`/api/development/projects/${id}/units`, { cache: "no-store" });
    const ju = await ru.json();
    setUnits(ju?.items || []);
    setLoading(false);
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [id]);

  const priceFmt = (n?: number, c?: string) =>
    typeof n === "number" ? new Intl.NumberFormat(undefined, { style: "currency", currency: c || "OMR" }).format(n) : "—";

  const soldCount = useMemo(() => units.filter(u => u.status === "sold").length, [units]);

  return (
    <>
      <Head><title>{item?.title || "تفاصيل المشروع"}</title></Head>

      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">{item?.title || "…"}</h1>
        <Link href="/development" className="px-3 py-2 rounded-lg border hover:bg-gray-50">الرجوع للقائمة</Link>
      </div>

      {loading && <div>جارِ التحميل…</div>}
      {!loading && !item && <div className="text-red-600">المشروع غير موجود.</div>}

      {!!item && (
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            <div className="border rounded-xl p-4">
              <div className="text-sm text-gray-600">{item.city || "—"} • {item.status || "planned"}</div>
              {item.deliveryDate && <div className="text-sm text-gray-600">التسليم: {new Date(item.deliveryDate).toLocaleDateString()}</div>}
              {item.description && <p className="mt-3 leading-7">{item.description}</p>}
              {!!item.amenities?.length && (
                <div className="mt-4">
                  <div className="font-semibold mb-2">المزايا</div>
                  <div className="flex flex-wrap gap-2">
                    {item.amenities.map((a, i) => <span key={i} className="text-xs px-2 py-1 rounded-full border">{a}</span>)}
                  </div>
                </div>
              )}
            </div>

            {!!item.milestones?.length && (
              <div className="border rounded-xl p-4">
                <div className="font-semibold mb-2">الجدول الزمني</div>
                <div className="space-y-2">
                  {item.milestones.map(m => (
                    <div key={m.id} className="flex items-center justify-between">
                      <div>{m.name}</div>
                      <div className="text-sm text-gray-600">
                        {m.dueAt ? new Date(m.dueAt).toLocaleDateString() : "—"} • {typeof m.progress === "number" ? `${m.progress}%` : "—"}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="border rounded-xl p-4">
              <div className="font-semibold mb-2">الوحدات المتاحة</div>
              <div className="space-y-2">
                {units.map(u => (
                  <div key={u.id} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">{u.type}</div>
                      <span className="text-xs px-2 py-1 rounded-full border">{u.status || "available"}</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      {u.area ? `${u.area} م²` : "—"} • {u.bedrooms ?? "—"} غرف • {u.bathrooms ?? "—"} حمام
                    </div>
                    <div className="mt-1 text-sm">{priceFmt(u.priceBase, u.currencyBase)}</div>
                  </div>
                ))}
                {!units.length && <div className="text-gray-500">لا يوجد وحدات.</div>}
              </div>
            </div>
            <div className="border rounded-xl p-4 text-sm text-gray-700">
              <div>إجمالي الوحدات: {units.length} • المباعة: {soldCount}</div>
            </div>

            <Link href={`/admin/development/projects/${item.id}`} className="block text-center w-full py-2 rounded-xl border hover:bg-gray-50">
              تحرير/اعتماد (مسؤول)
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
