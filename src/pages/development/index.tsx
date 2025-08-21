import Head from "next/head";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Project = {
  id: string; title: string; city?: string;
  status?: "planned" | "selling" | "delivered";
  deliveryDate?: string; amenities?: string[];
  createdAt?: string; updatedAt?: string;
};

export default function DevelopmentListPage() {
  const [items, setItems] = useState<Project[]>([]);
  const [q, setQ] = useState("");

  const load = async () => {
    const r = await fetch(`/api/development/projects?q=${encodeURIComponent(q)}`, { cache: "no-store" });
    const j = await r.json();
    setItems(j?.items || []);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);
  useEffect(() => { const t = setTimeout(load, 250); return () => clearTimeout(t); }, [q]);

  const grouped = useMemo(() => {
    const g: Record<string, Project[]> = { planned: [], selling: [], delivered: [] };
    for (const p of items) (g[p.status || "planned"] ||= []).push(p);
    return g;
  }, [items]);

  return (
    <>
      <Head><title>مشروعات التطوير العقاري</title></Head>

      <h1 className="text-2xl font-bold mb-4">مشروعات التطوير العقاري</h1>

      <div className="flex items-center gap-3 mb-6">
        <input
          className="border rounded-lg px-3 py-2 w-full"
          placeholder="بحث باسم المشروع أو المدينة…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <Link href="/admin/development/projects" className="px-3 py-2 rounded-lg border hover:bg-gray-50">
          لوحة التطوير
        </Link>
      </div>

      {(["selling", "planned", "delivered"] as const).map((k) => (
        <section key={k} className="mb-8">
          <h2 className="text-xl font-semibold mb-3">
            {k === "selling" ? "يتم البيع الآن" : k === "planned" ? "قيد التخطيط" : "تم التسليم"}
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            {(grouped[k] || []).map((p) => (
              <Link key={p.id} href={`/development/projects/${p.id}`} className="block border rounded-xl p-4 hover:shadow-md transition">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-semibold">{p.title}</div>
                  <span className="text-xs px-2 py-1 rounded-full border">{p.status}</span>
                </div>
                <div className="text-sm text-gray-600">{p.city || "—"}</div>
                {!!p.amenities?.length && (
                  <div className="mt-2 text-xs text-gray-500 truncate">
                    {p.amenities.slice(0, 4).join(" • ")}{p.amenities.length > 4 ? " …" : ""}
                  </div>
                )}
              </Link>
            ))}
            {!grouped[k]?.length && <div className="text-gray-500">لا يوجد عناصر.</div>}
          </div>
        </section>
      ))}
    </>
  );
}