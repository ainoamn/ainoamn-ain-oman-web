// src/pages/index.tsx (HOTFIX — safe guards, no destructive changes)
import React, { useEffect, useState } from "react";
import Link from "next/link";

type Auction = { id: string; title: string; image?: string; currentBid?: number; endsAt?: string; };
type Property = { id: string; title: string; image?: string; price?: number; city?: string; type?: string; };
type DevProject = { id: string; name: string; city?: string; image?: string; status?: string; };
type Task = { id: string; title: string; priority: "low"|"medium"|"high"|"critical"; status: string; createdAt?: string; };

// Helpers
const toArray = (x: any) => {
  if (Array.isArray(x)) return x;
  if (x && Array.isArray(x.items)) return x.items;
  if (x && Array.isArray(x.data)) return x.data;
  return [];
};
async function safeJson(url: string, fallback: any) {
  try {
    const r = await fetch(url);
    if (!r.ok) return fallback;
    return await r.json();
  } catch { return fallback; }
}

export default function HomePage() {
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [projects, setProjects] = useState<DevProject[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    (async () => {
      const [a, p, d, t] = await Promise.all([
        safeJson("/api/auctions?limit=6", [
          { id: "A-1001", title: "مزاد أرض سكنية — المعبيلة", currentBid: 120000, endsAt: "2025-09-12" },
          { id: "A-1002", title: "مزاد شقة فاخرة — مسقط", currentBid: 84000, endsAt: "2025-09-01" },
        ]),
        safeJson("/api/properties?limit=8", [
          { id: "P-2001", title: "شقة غرفتين وصالة – الخوض", price: 42000, city: "مسقط", type: "شقة" },
          { id: "P-2002", title: "أرض سكنية — العامرات", price: 28000, city: "مسقط", type: "أرض" },
        ]),
        safeJson("/api/development/projects?limit=6", [
          { id: "PR-OM-2025-000001", name: "مجمع الواجهة — بوشر", city: "مسقط", status: "selling" },
          { id: "PR-OM-2025-000002", name: "أبراج النسيم — نزوى", city: "الداخلية", status: "planned" },
        ]),
        safeJson("/api/tasks?limit=5", [
          { id: "AO-T-000001", title: "تحديث صفحة التفاصيل", priority: "high", status: "open", createdAt: "2025-08-18T10:07:52Z" },
          { id: "AO-T-000002", title: "توليد ملف ICS", priority: "medium", status: "in_progress", createdAt: "2025-08-18T14:55:12Z" },
        ]),
      ]);
      setAuctions(toArray(a));
      setProperties(toArray(p));
      setProjects(toArray(d));
      setTasks(toArray(t));
    })();
  }, []);

  return (
    <div className="pb-16">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-teal-50 to-white dark:from-neutral-900 dark:to-neutral-950" />
        <div className="relative z-10 max-w-6xl mx-auto pt-14 md:pt-20 px-4">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1">
              <h1 className="text-3xl md:text-5xl font-bold leading-tight">
                عين عُمان — منصّة عقارية ذكية
              </h1>
              <p className="mt-4 text-neutral-700 dark:text-neutral-300">
                بيع وشراء وتأجير واستثمار وإدارة عقاراتك، مع مزادات فورية، مطوّرين، ولوحة مهام.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/properties" className="px-5 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white">تصفح العقارات</Link>
                <Link href="/auctions" className="px-5 py-3 rounded-xl border border-neutral-200 dark:border-neutral-800">المزادات</Link>
                <Link href="/development" className="px-5 py-3 rounded-xl border border-neutral-200 dark:border-neutral-800">التطوير العقاري</Link>
                <Link href="/admin/tasks" className="px-5 py-3 rounded-xl border border-neutral-200 dark:border-neutral-800">لوحة المهام</Link>
              </div>
            </div>
            <div className="flex-1 rounded-3xl border border-neutral-200 dark:border-neutral-800 p-4 bg-white dark:bg-neutral-900">
              <div className="grid grid-cols-2 gap-3">
                {(properties ?? []).slice(0,4).map((p) => (
                  <div key={(p as any).id ?? Math.random()} className="rounded-2xl border p-3 text-sm hover:shadow-sm transition">
                    <div className="aspect-video rounded-xl bg-neutral-100 dark:bg-neutral-800 mb-2" />
                    <div className="font-semibold line-clamp-1">{(p as any).title ?? "—"}</div>
                    <div className="text-xs text-neutral-600 dark:text-neutral-400">{(p as any).city ?? "—"}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto mt-12 px-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl md:text-2xl font-bold">عقارات مميزة</h2>
          <Link href="/properties" className="text-teal-700 hover:underline">عرض الكل</Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
          {(properties ?? []).map((p) => (
            <Link key={(p as any).id ?? Math.random()} href={`/properties/${(p as any).id ?? ""}`} className="rounded-2xl border border-neutral-200 dark:border-neutral-800 p-3 hover:shadow-sm transition block">
              <div className="aspect-video rounded-xl bg-neutral-100 dark:bg-neutral-800 mb-2" />
              <div className="font-semibold line-clamp-1">{(p as any).title ?? "—"}</div>
              <div className="text-xs text-neutral-600 dark:text-neutral-400">
                {(p as any).type ?? "—"} · {(p as any).city ?? "—"}
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto mt-12 px-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl md:text-2xl font-bold">مزادات نشِطة</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          {(auctions ?? []).map((a) => (
            <Link key={(a as any).id ?? Math.random()} href={`/auctions/${(a as any).id ?? ""}`} className="rounded-2xl border border-neutral-200 dark:border-neutral-800 p-4 hover:shadow-sm transition block">
              <div className="aspect-video rounded-xl bg-neutral-100 dark:bg-neutral-800 mb-3" />
              <div className="font-semibold line-clamp-1">{(a as any).title ?? "—"}</div>
              <div className="text-xs text-neutral-600 dark:text-neutral-400">ينتهي: {(a as any).endsAt ?? "—"}</div>
            </Link>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto mt-12 px-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl md:text-2xl font-bold">مشاريع التطوير العقاري</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          {(projects ?? []).map((pr) => (
            <Link key={(pr as any).id ?? Math.random()} href={`/development/projects/${(pr as any).id ?? ""}`} className="rounded-2xl border border-neutral-200 dark:border-neutral-800 p-4 hover:shadow-sm transition block">
              <div className="aspect-video rounded-xl bg-neutral-100 dark:bg-neutral-800 mb-3" />
              <div className="font-semibold line-clamp-1">{(pr as any).name ?? "—"}</div>
              <div className="text-xs text-neutral-600 dark:text-neutral-400">{(pr as any).city ?? "—"} · {(pr as any).status ?? "—"}</div>
            </Link>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto mt-12 px-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl md:text-2xl font-bold">مهام حديثة (إدارة)</h2>
          <Link href="/admin/tasks" className="text-teal-700 hover:underline">لوحة المهام</Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {(tasks ?? []).map((t) => (
            <Link key={(t as any).id ?? Math.random()} href={`/admin/tasks/${(t as any).id ?? ""}`} className="rounded-2xl border border-neutral-200 dark:border-neutral-800 p-4 hover:shadow-sm transition block">
              <div className="font-semibold line-clamp-1">{(t as any).title ?? "—"}</div>
              <div className="text-xs text-neutral-600 dark:text-neutral-400">الأولوية: {(t as any).priority ?? "—"} · الحالة: {(t as any).status ?? "—"}</div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
